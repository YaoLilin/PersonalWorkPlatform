import {useLoaderData} from "react-router-dom";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin, {Draggable} from "@fullcalendar/interaction";
import zhCnLocale from "@fullcalendar/core/locales/zh-cn";
import {Button, Card, Checkbox, DatePicker, Input, Modal, Space, TimePicker, Tooltip, Tree} from "antd";
import {BarChartOutlined, ClockCircleOutlined, ExpandOutlined, FolderOutlined, PieChartOutlined} from "@ant-design/icons";
import dayjs from "dayjs";
import ReactECharts from "echarts-for-react";
import {useContext, useEffect, useMemo, useRef, useState} from "react";
import {createRoot} from "react-dom/client";
import "./schedule.css";
import ScheduleApi from "../../request/scheduleApi";
import {TypeApi} from "../../request/typeApi";
import {ProjectApi} from "../../request/projectApi";
import {MessageContext} from "../../provider/MessageProvider";
import ProjectBrowser from "../../components/public/projectBrowser";
import {UserContext} from "../../provider/UserProvider";

const EVENT_EDITOR_WIDTH = 350;
const EVENT_EDITOR_HEIGHT = 400;
const EDITOR_VIEWPORT_OFFSET = 8;
const HIDDEN_TIME_RANGE_STORAGE_PREFIX = "schedule-hidden-time-range";

/**
 * 将项目记录的日期和时间转换为日历事件时间。
 *
 * @param {string} date 项目记录日期
 * @param {string} time 项目记录时间
 * @returns {string} ISO 日期时间字符串
 */
function toDateTime(date, time) {
    const normalizedTime = time.length === 5 ? `${time}:00` : time;
    return `${date}T${normalizedTime}`;
}

/**
 * 获取外部项目拖入日历后，编辑器应依附的目标单元格区域。
 *
 * @param {HTMLElement | null} calendarElement 日历根元素
 * @param {Date} eventStart 日程开始时间
 * @returns {DOMRect | undefined} 目标单元格区域
 */
function getDroppedEventRect(calendarElement, eventStart) {
    if (!calendarElement) {
        return undefined;
    }
    const startTime = dayjs(eventStart);
    const date = startTime.format("YYYY-MM-DD");
    const time = startTime.format("HH:mm:ss");
    const timeSlot = calendarElement.querySelector(`.fc-timegrid-slot-lane[data-time="${time}"]`);
    const dayColumn = calendarElement.querySelector(`.fc-timegrid-col[data-date="${date}"]`);
    if (timeSlot && dayColumn) {
        const slotRect = timeSlot.getBoundingClientRect();
        const columnRect = dayColumn.getBoundingClientRect();
        return new DOMRect(columnRect.left, slotRect.top, columnRect.width, slotRect.height);
    }
    return calendarElement.querySelector(`.fc-daygrid-day[data-date="${date}"]`)?.getBoundingClientRect();
}

/**
 * 将项目时间记录转换为 FullCalendar 日程事件。<br>
 * <p>只保留日期、开始时间、结束时间和项目名称均有效的记录。</p>
 *
 * @param {Array} projectTimes 周统计项目时间记录
 * @returns {Array} FullCalendar 可展示的日程事件
 */
function toScheduleEvents(projectTimes) {
    return projectTimes
        .filter((projectTime) => projectTime.date && projectTime.startTime && projectTime.endTime && projectTime.projectName)
        .map((projectTime) => ({
            id: String(projectTime.id),
            title: projectTime.scheduleName || projectTime.projectName,
            start: toDateTime(projectTime.date, projectTime.startTime),
            end: toDateTime(projectTime.endDate || projectTime.date, projectTime.endTime),
            backgroundColor: projectTime.projectColor || "#1677FF",
            borderColor: projectTime.projectColor || "#1677FF",
            extendedProps: {
                projectId: projectTime.projectId,
                projectName: projectTime.projectName,
                projectColor: projectTime.projectColor || "#1677FF",
                description: projectTime.description || "",
                scheduleId: projectTime.id,
            },
        }));
}

/**
 * 将 FullCalendar 事件转换为日程接口参数。
 *
 * @param {Object} calendarEvent FullCalendar 事件
 * @returns {Object} 日程接口参数
 */
function toScheduleParam(calendarEvent) {
    const startTime = dayjs(calendarEvent.start);
    const endTime = calendarEvent.end ? dayjs(calendarEvent.end) : startTime.add(1, "hour");
    return {
        projectId: calendarEvent.extendedProps.projectId,
        scheduleName: calendarEvent.title,
        description: calendarEvent.extendedProps.description || "",
        date: startTime.format("YYYY-MM-DD"),
        endDate: endTime.format("YYYY-MM-DD"),
        startTime: startTime.format("HH:mm:ss"),
        endTime: endTime.format("HH:mm:ss"),
    };
}

/**
 * 获取接口错误信息。
 *
 * @param {Object} error 请求异常
 * @returns {string} 可展示的错误提示
 */
function getErrorMessage(error) {
    return error?.response?.data?.message || error?.message || "日程保存失败";
}

/**
 * 获取当前用户隐藏时间范围的本地存储键。
 *
 * @param {string} userName 当前登录用户名
 * @returns {string} 本地存储键
 */
function getHiddenTimeRangeStorageKey(userName) {
    return `${HIDDEN_TIME_RANGE_STORAGE_PREFIX}-${userName || "anonymous"}`;
}

/**
 * 获取用户保存的隐藏时间范围。
 *
 * @param {string} userName 当前登录用户名
 * @returns {{start: string, end: string} | null} 隐藏时间范围
 */
function getHiddenTimeRange(userName) {
    try {
        const timeRange = JSON.parse(localStorage.getItem(getHiddenTimeRangeStorageKey(userName)));
        return timeRange?.start && timeRange?.end && timeRange.start < timeRange.end
            ? {...timeRange, enabled: timeRange.enabled !== false} : null;
    } catch (error) {
        console.error("无法读取隐藏时间范围", error);
        return null;
    }
}

/**
 * 将时间字符串转换为时间选择器值。
 *
 * @param {string} time 时间字符串，格式为 HH:mm
 * @returns {dayjs.Dayjs} 时间选择器值
 */
function toTimePickerValue(time) {
    const [hour, minute] = time.split(":").map(Number);
    return dayjs().startOf("day").hour(hour).minute(minute);
}

/**
 * 获取指针所在的日程时间。
 *
 * @param {HTMLElement} calendarElement 日程组件根元素
 * @param {PointerEvent} pointerEvent 指针事件
 * @returns {dayjs.Dayjs | null} 指针对应的时间
 */
function getPointerScheduleTime(calendarElement, pointerEvent) {
    const timeSlot = [...calendarElement.querySelectorAll(".fc-timegrid-slot-lane[data-time]")]
        .find((slot) => {
            const rect = slot.getBoundingClientRect();
            return pointerEvent.clientY >= rect.top && pointerEvent.clientY < rect.bottom;
        });
    if (!timeSlot) {
        return null;
    }
    const timeColumn = [...calendarElement.querySelectorAll(".fc-timegrid-col[data-date]")]
        .find((column) => {
            const rect = column.getBoundingClientRect();
            return pointerEvent.clientX >= rect.left && pointerEvent.clientX <= rect.right;
        });
    if (!timeColumn?.dataset.date || !timeSlot.dataset.time) {
        return null;
    }
    const slotRect = timeSlot.getBoundingClientRect();
    const minuteOffset = Math.min(15, Math.max(0, pointerEvent.clientY - slotRect.top) >= slotRect.height / 2 ? 15 : 0);
    return dayjs(`${timeColumn.dataset.date}T${timeSlot.dataset.time}`).add(minuteOffset, "minute");
}

/**
 * 构建拖动选中时间范围。
 *
 * @param {dayjs.Dayjs} startTime 拖动开始时间
 * @param {dayjs.Dayjs} currentTime 当前指针时间
 * @returns {{start: dayjs.Dayjs, end: dayjs.Dayjs}} 选中时间范围
 */
function getSelectionTimeRange(startTime, currentTime) {
    return currentTime.isBefore(startTime)
        ? {start: currentTime, end: startTime.add(15, "minute")}
        : {start: startTime, end: currentTime.add(15, "minute")};
}

/**
 * 判断时间轴时段是否应隐藏。
 *
 * @param {Date} date 时间轴时段的日期时间
 * @param {{start: string, end: string} | null} hiddenTimeRange 隐藏时间范围
 * @returns {boolean} 是否隐藏
 */
function isHiddenTimeSlot(date, hiddenTimeRange) {
    if (!hiddenTimeRange?.enabled) {
        return false;
    }
    const time = dayjs(date).format("HH:mm");
    return time >= hiddenTimeRange.start && time < hiddenTimeRange.end;
}

/**
 * 获取隐藏时间段设置按钮的悬浮提示。
 *
 * @param {{start: string, end: string} | null} hiddenTimeRange 隐藏时间范围
 * @returns {string} 按钮悬浮提示
 */
function getHiddenTimeRangeHint(hiddenTimeRange) {
    return hiddenTimeRange
        ? `设置隐藏时间段（当前：${hiddenTimeRange.start} - ${hiddenTimeRange.end}，${hiddenTimeRange.enabled ? "已启用" : "未启用"}）`
        : "设置隐藏时间段";
}

/**
 * 隐藏时间范围按钮内容。
 *
 * @param {{hiddenTimeRange: {start: string, end: string, enabled: boolean} | null, onEnabledChange: Function}} props 按钮属性
 * @returns {JSX.Element} 工具栏按钮内容
 */
const HiddenTimeRangeButtonContent = ({hiddenTimeRange, onEnabledChange}) => (
    <span className="schedule-hidden-time-range-button-content">
        <ClockCircleOutlined/>
        {hiddenTimeRange && <>
            <span>{hiddenTimeRange.start} - {hiddenTimeRange.end}</span>
            <Checkbox className="schedule-hidden-time-range-checkbox" checked={hiddenTimeRange.enabled}
                      onChange={(event) => onEnabledChange(event.target.checked)}/>
        </>}
    </span>
);

/**
 * 截断小时数至两位小数。<br>
 * <p>统计展示不进行四舍五入。</p>
 *
 * @param {number} value 原始小时数或百分比
 * @returns {number} 截断后的数值
 */
function truncateToTwoDigits(value) {
    return Math.floor(value * 100) / 100;
}

/**
 * 格式化截断后的小时数。
 *
 * @param {number} hours 原始小时数
 * @returns {string} 两位小数小时数
 */
function formatHours(hours) {
    return truncateToTwoDigits(hours).toFixed(2);
}

/**
 * 获取当前自然周的起止时间。<br>
 * <p>自然周从周一开始，到下周一开始前结束。</p>
 *
 * @returns {{start: dayjs.Dayjs, end: dayjs.Dayjs}} 当前周时间范围
 */
function getCurrentWeekRange() {
    const today = dayjs().startOf("day");
    const daysSinceMonday = today.day() === 0 ? 6 : today.day() - 1;
    return {
        start: today.subtract(daysSinceMonday, "day"),
        end: today.subtract(daysSinceMonday, "day").add(1, "week"),
    };
}

/**
 * 按项目汇总指定范围内的日程时长。<br>
 * <p>跨范围日程仅统计落在统计范围内的时长。</p>
 *
 * @param {Array} scheduleEvents 日程组件的事件数据
 * @param {{start: dayjs.Dayjs, end: dayjs.Dayjs}} statisticsRange 当前视图的统计范围
 * @returns {Array} 项目时间统计数据
 */
function getProjectTimeStatistics(scheduleEvents, statisticsRange) {
    const {start: rangeStart, end: rangeEnd} = statisticsRange;
    const projectStatistics = new Map();
    scheduleEvents.forEach((event) => {
        const eventStart = dayjs(event.start);
        const eventEnd = dayjs(event.end);
        if (!eventStart.isValid() || !eventEnd.isValid() || !eventEnd.isAfter(eventStart)
            || !eventStart.isBefore(rangeEnd) || !eventEnd.isAfter(rangeStart)) {
            return;
        }
        const projectId = event.extendedProps?.projectId;
        const projectName = event.extendedProps?.projectName || event.title;
        const projectKey = projectId === undefined ? projectName : String(projectId);
        const overlappingStart = eventStart.isAfter(rangeStart) ? eventStart : rangeStart;
        const overlappingEnd = eventEnd.isBefore(rangeEnd) ? eventEnd : rangeEnd;
        const duration = overlappingEnd.diff(overlappingStart, "minute", true) / 60;
        const statistic = projectStatistics.get(projectKey) || {
            name: projectName,
            value: 0,
            itemStyle: {color: event.extendedProps?.projectColor || event.backgroundColor || "#1677FF"},
        };
        statistic.value += duration;
        projectStatistics.set(projectKey, statistic);
    });
    return Array.from(projectStatistics.values());
}

/**
 * 获取统计卡片标题。
 *
 * @param {string} viewType FullCalendar 视图类型
 * @returns {string} 统计卡片标题
 */
function getProjectTimeStatisticsTitle(viewType) {
    if (viewType === "dayGridMonth") {
        return "本月项目时间占比";
    }
    if (viewType === "timeGridDay") {
        return "当日项目时间占比";
    }
    return "本周项目时间占比";
}

/**
 * 获取统计时长的展示文案。
 *
 * @param {string} viewType FullCalendar 视图类型
 * @returns {string} 统计时长展示文案
 */
function getProjectTimeTotalLabel(viewType) {
    if (viewType === "dayGridMonth") {
        return "本月项目总时间";
    }
    if (viewType === "timeGridDay") {
        return "当日项目总时间";
    }
    return "本周项目总时间";
}

/**
 * 格式化统计图悬浮提示。
 *
 * @param {Object} params 图表数据项
 * @param {number} totalHours 项目总时长
 * @returns {string} 悬浮提示内容
 */
function formatProjectTimeTooltip(params, totalHours) {
    const percent = totalHours === 0 ? 0 : truncateToTwoDigits(params.value / totalHours * 100);
    return `<div style="font-size: 12px;display: flex;align-items: center">${params.marker}
        <span style="padding: 0 10px;display: inline-block;max-width: 180px;word-break: break-all">${params.name}</span>
        <span>${formatHours(params.value)} 小时 ${percent.toFixed(2)}%</span></div>`;
}

/**
 * 项目时间统计图。<br>
 * <p>支持项目时间占比饼图与按时长降序排列的柱状图。</p>
 *
 * @param {{data: Array, chartType: string, expanded: boolean}} props 图表属性
 * @returns {JSX.Element} 项目时间统计图
 */
const ProjectTimeChart = ({data, chartType, expanded = false}) => {
    const sortedData = [...data].sort((first, second) => second.value - first.value);
    const totalHours = sortedData.reduce((total, item) => total + item.value, 0);
    const isBarChart = chartType === "bar";
    const option = {
        tooltip: {
            trigger: "item",
            appendToBody: true,
            confine: false,
            className: "schedule-project-time-tooltip",
            formatter: (params) => formatProjectTimeTooltip(params, totalHours),
        },
        ...(isBarChart ? {
            grid: {top: 8, right: expanded ? 96 : 52, bottom: 4, left: expanded ? 130 : 10, containLabel: expanded},
            xAxis: {
                type: "value",
                axisLine: {show: false},
                axisTick: {show: false},
                axisLabel: {show: false},
            },
            yAxis: {
                type: "category",
                data: sortedData.map((item) => item.name),
                inverse: true,
                axisLine: {show: false},
                axisTick: {show: false},
                splitLine: {show: false},
                axisLabel: {
                    show: expanded,
                    formatter: (name) => name.length > (expanded ? 16 : 9) ? `${name.slice(0, expanded ? 16 : 9)}…` : name,
                },
            },
            series: [{
                name: "项目时间统计",
                type: "bar",
                data: sortedData,
                barMaxWidth: 30,
                barCategoryGap: "35%",
                itemStyle: {borderRadius: [0, 4, 4, 0]},
                label: {show: true, position: "right", color: "#595959", formatter: (params) => `${formatHours(params.value)} 小时`},
            }],
        } : {
            series: [{
                name: "项目时间统计",
                type: "pie",
                radius: expanded ? ["38%", "63%"] : ["42%", "64%"],
                center: ["50%", "50%"],
                data: sortedData,
                padAngle: 2,
                itemStyle: {borderColor: "#fff", borderWidth: 3, borderRadius: 8},
                label: expanded ? {
                    show: true,
                    formatter: (params) => `${params.name}\n${params.percent}%`,
                    overflow: "truncate",
                    width: 110,
                } : {show: false},
                labelLine: {show: expanded},
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: "rgba(0, 0, 0, 0.5)",
                    },
                },
            }],
        }),
    };
    return <ReactECharts className={expanded ? "schedule-project-time-chart-expanded" : "schedule-project-time-chart"}
                         option={option} notMerge/>;
};

/**
 * 项目时间图例。
 *
 * @param {{data: Array}} props 项目时间统计数据
 * @returns {JSX.Element} 项目时间图例
 */
const ProjectTimeLegend = ({data}) => (
    <div className="schedule-project-time-legend">
        {[...data].sort((first, second) => second.value - first.value).map((item) => (
            <div className="schedule-project-time-legend-item" key={item.name}>
                <span className="schedule-project-time-legend-color" style={{backgroundColor: item.itemStyle.color}}/>
                <Tooltip title={item.name}>
                    <span className="schedule-project-time-legend-name">{item.name}</span>
                </Tooltip>
                <span>{formatHours(item.value)} 小时</span>
            </div>
        ))}
    </div>
);

/**
 * 项目时间统计内容。
 *
 * @param {{data: Array, totalHours: number, chartType: string, expanded: boolean, totalLabel: string}} props 统计内容属性
 * @returns {JSX.Element} 项目时间统计内容
 */
const ProjectTimeStatisticsContent = ({data, totalHours, chartType, expanded = false, totalLabel}) => (
    <>
        <div className="schedule-project-time-total">{totalLabel}：{formatHours(totalHours)} 小时</div>
        {!expanded && <ProjectTimeLegend data={data}/>}
        <ProjectTimeChart data={data} chartType={chartType} expanded={expanded}/>
    </>
);

/**
 * 判断日程编辑窗口中的内容是否发生变化。
 *
 * @param {Object} editor 日程编辑窗口状态
 * @returns {boolean} 是否需要保存
 */
function hasEventEditorChanged(editor) {
    const [startTime, endTime] = editor.timeRange || [];
    return (editor.title.trim() || "未命名日程") !== editor.originalEvent.title
        || editor.description !== editor.originalEvent.description
        || editor.projectId !== editor.originalEvent.projectId
        || !startTime?.isSame(editor.originalEvent.start)
        || !endTime?.isSame(editor.originalEvent.end);
}

/**
 * 将项目添加到所属的类型树节点。<br>
 * <p>项目类型可位于树的任意层级，未分配类型的项目归入“未分类项目”。</p>
 *
 * @param {Array} typeTree 类型树
 * @param {Array} projects 项目列表
 * @returns {Array} 包含项目叶子节点的树数据
 */
function toProjectTree(typeTree, projects) {
    const typeNodes = toTypeNodes(typeTree, projects);
    const uncategorizedProjects = projects.filter((project) => !project.typeId)
        .map(toProjectTreeNode);
    return uncategorizedProjects.length > 0
        ? [...typeNodes, {key: "uncategorized-projects", title: "未分类项目", children: uncategorizedProjects}]
        : typeNodes;
}

/**
 * 递归构建类型节点及其直属项目节点。
 *
 * @param {Array} typeTree 当前层级的类型节点
 * @param {Array} projects 项目列表
 * @returns {Array} 类型树节点
 */
function toTypeNodes(typeTree, projects) {
    return typeTree.map((type) => ({
        key: `type-${type.value}`,
        title: <span><FolderOutlined className="schedule-type-icon"/>{type.title}</span>,
        children: [
            ...(type.children ? toTypeNodes(type.children, projects) : []),
            ...projects.filter((project) => project.typeId === type.value)
                .map(toProjectTreeNode),
        ],
    }));
}

/**
 * 构建可拖入日历的项目叶子节点。
 *
 * @param {Object} project 项目数据
 * @returns {Object} 项目树节点
 */
function toProjectTreeNode(project) {
    return {
        key: `project-${project.id}`,
        title: <span className="schedule-project-item"
                     data-project-id={project.id}
                     data-project-name={project.name}>
            <span className="schedule-project-color" style={{backgroundColor: project.color || "#1677FF"}}/>
            {project.name}
        </span>,
        isLeaf: true,
    };
}

/**
 * 获取所有周统计项目时间记录。
 *
 * @returns {Promise<Array>} 日程事件列表
 */
export async function loader() {
    const [projectTimes, typeTree, projects] = await Promise.all([
        ScheduleApi.getSchedule(),
        TypeApi.getTypeTree({}),
        ProjectApi.getProjects({}),
    ]);
    const activeProjects = projects.filter((project) => project.state === 1);
    return {
        events: toScheduleEvents(projectTimes),
        projectTree: toProjectTree(typeTree, activeProjects),
        projectOptions: activeProjects.map((project) => ({value: project.id, label: project.name})),
    };
}

/**
 * 日程页面组件。<br>
 * <p>展示周统计项目情况表格中已记录的任务，支持月、周、日视图、拖拽、右键删除及前端编辑。</p>
 *
 * @returns {JSX.Element} 日程页面
 */
const SchedulePage = () => {
    const {events, projectTree, projectOptions} = useLoaderData();
    const messageApi = useContext(MessageContext);
    const {user} = useContext(UserContext);
    const projectTreeRef = useRef(null);
    const calendarRef = useRef(null);
    const hiddenTimeRangeButtonRootRef = useRef(null);
    const [contextMenu, setContextMenu] = useState(null);
    const [eventEditor, setEventEditor] = useState(null);
    const [scheduleEvents, setScheduleEvents] = useState(events);
    const [hiddenTimeRange, setHiddenTimeRange] = useState(() => getHiddenTimeRange(user?.name));
    const [hiddenTimeRangeEditor, setHiddenTimeRangeEditor] = useState(null);
    const [isHiddenTimeRangeModalOpen, setIsHiddenTimeRangeModalOpen] = useState(false);
    const [projectTimeChartType, setProjectTimeChartType] = useState("pie");
    const [isProjectTimeStatisticsModalOpen, setIsProjectTimeStatisticsModalOpen] = useState(false);
    const [selectionTimePreview, setSelectionTimePreview] = useState(null);
    const [statisticsRange, setStatisticsRange] = useState(() => ({
        ...getCurrentWeekRange(),
        viewType: "timeGridWeek",
    }));
    const projectTimeStatistics = useMemo(() => getProjectTimeStatistics(scheduleEvents, statisticsRange),
        [scheduleEvents, statisticsRange]);
    const totalProjectHours = projectTimeStatistics.reduce((total, item) => total + item.value, 0);

    const replaceScheduleEvent = (scheduleEvent) => {
        const [updatedEvent] = toScheduleEvents([scheduleEvent]);
        setScheduleEvents((currentEvents) => currentEvents.map((event) => event.id === updatedEvent.id ? updatedEvent : event));
    };

    useEffect(() => {
        if (!projectTreeRef.current) {
            return undefined;
        }
        const draggable = new Draggable(projectTreeRef.current, {
            itemSelector: ".schedule-project-item",
            eventData: (element) => ({
                title: element.dataset.projectName,
                duration: "01:00",
                extendedProps: {projectId: element.dataset.projectId},
            }),
        });
        return () => draggable.destroy();
    }, []);

    useEffect(() => {
        setHiddenTimeRange(getHiddenTimeRange(user?.name));
    }, [user?.name]);

    useEffect(() => {
        const closeContextMenu = () => setContextMenu(null);
        document.addEventListener("click", closeContextMenu);
        return () => document.removeEventListener("click", closeContextMenu);
    }, []);

    useEffect(() => {
        const calendarElement = calendarRef.current?.elRef?.current;
        if (!calendarElement) {
            return undefined;
        }
        let startTime = null;
        const handlePointerDown = (event) => {
            startTime = getPointerScheduleTime(calendarElement, event);
        };
        const handlePointerMove = (event) => {
            if (!startTime) {
                return;
            }
            const currentTime = getPointerScheduleTime(calendarElement, event);
            if (!currentTime) {
                return;
            }
            const timeRange = getSelectionTimeRange(startTime, currentTime);
            setSelectionTimePreview({...timeRange, left: event.clientX + 12, top: event.clientY + 12});
        };
        const clearSelectionPreview = () => {
            startTime = null;
            setSelectionTimePreview(null);
        };
        calendarElement.addEventListener("pointerdown", handlePointerDown);
        calendarElement.addEventListener("pointermove", handlePointerMove);
        document.addEventListener("pointerup", clearSelectionPreview);
        return () => {
            calendarElement.removeEventListener("pointerdown", handlePointerDown);
            calendarElement.removeEventListener("pointermove", handlePointerMove);
            document.removeEventListener("pointerup", clearSelectionPreview);
        };
    }, []);

    useEffect(() => {
        const calendarElement = calendarRef.current?.elRef?.current;
        const button = calendarElement?.querySelector(".fc-hiddenTimeRange-button");
        if (!button) {
            return;
        }
        if (hiddenTimeRangeButtonRootRef.current?.button !== button) {
            hiddenTimeRangeButtonRootRef.current?.root.unmount();
            hiddenTimeRangeButtonRootRef.current = {button, root: createRoot(button)};
        }
        hiddenTimeRangeButtonRootRef.current.root.render(
            <HiddenTimeRangeButtonContent hiddenTimeRange={hiddenTimeRange}
                                          onEnabledChange={setHiddenTimeRangeEnabled}/>,
        );
    });

    useEffect(() => () => hiddenTimeRangeButtonRootRef.current?.root.unmount(), []);

    const openEventEditor = (info) => {
        void saveEvent();
        const eventEnd = info.event.end ? dayjs(info.event.end) : dayjs(info.event.start).add(1, "hour");
        const eventRect = info.el.getBoundingClientRect();
        const rightEditorOffset = EDITOR_VIEWPORT_OFFSET;
        const leftEditorOffset = 2;
        const editorLeft = eventRect.right + rightEditorOffset + EVENT_EDITOR_WIDTH <= window.innerWidth
            ? eventRect.right + rightEditorOffset
            : eventRect.left - EVENT_EDITOR_WIDTH - leftEditorOffset;
        setContextMenu(null);
        setEventEditor({
            eventId: info.event.id,
            title: info.event.title,
            description: info.event.extendedProps.description || "",
            projectId: info.event.extendedProps.projectId,
            originalEvent: {
                title: info.event.title,
                start: info.event.start,
                end: eventEnd.toDate(),
                description: info.event.extendedProps.description || "",
                projectId: info.event.extendedProps.projectId,
                backgroundColor: info.event.backgroundColor,
                borderColor: info.event.borderColor,
            },
            timeRange: [dayjs(info.event.start), eventEnd],
            left: Math.max(leftEditorOffset, Math.min(editorLeft, window.innerWidth - EVENT_EDITOR_WIDTH - rightEditorOffset)),
            top: Math.max(EDITOR_VIEWPORT_OFFSET, Math.min(eventRect.bottom + EDITOR_VIEWPORT_OFFSET,
                window.innerHeight - EVENT_EDITOR_HEIGHT - EDITOR_VIEWPORT_OFFSET)),
        });
    };

    const saveEvent = async (shouldCreate = false) => {
        const currentEditor = eventEditor;
        if (!currentEditor) {
            return;
        }
        if (currentEditor.isNew) {
            setEventEditor(null);
            if (shouldCreate) {
                await createNewSchedule(currentEditor);
            }
            return;
        }
        const calendarApi = calendarRef.current?.getApi();
        const calendarEvent = calendarApi?.getEventById(currentEditor.eventId);
        const [startTime, endTime] = currentEditor.timeRange || [];
        if (!calendarEvent || !startTime || !endTime) {
            return;
        }
        if (!hasEventEditorChanged(currentEditor)) {
            setEventEditor(null);
            return;
        }
        calendarEvent.setProp("title", currentEditor.title.trim() || "未命名日程");
        calendarEvent.setStart(startTime.toDate());
        calendarEvent.setEnd(endTime.toDate());
        calendarEvent.setExtendedProp("description", currentEditor.description);
        calendarEvent.setExtendedProp("projectId", currentEditor.projectId);
        setEventEditor(null);
        try {
            const scheduleEvent = await ScheduleApi.updateSchedule(calendarEvent.extendedProps.scheduleId || calendarEvent.id,
                toScheduleParam(calendarEvent));
            calendarEvent.setProp("backgroundColor", scheduleEvent.projectColor || "#1677FF");
            calendarEvent.setProp("borderColor", scheduleEvent.projectColor || "#1677FF");
            replaceScheduleEvent(scheduleEvent);
        } catch (error) {
            calendarEvent.setProp("title", currentEditor.originalEvent.title);
            calendarEvent.setStart(currentEditor.originalEvent.start);
            calendarEvent.setEnd(currentEditor.originalEvent.end);
            calendarEvent.setProp("backgroundColor", currentEditor.originalEvent.backgroundColor);
            calendarEvent.setProp("borderColor", currentEditor.originalEvent.borderColor);
            calendarEvent.setExtendedProp("description", currentEditor.originalEvent.description);
            messageApi.error(getErrorMessage(error), 5);
        }
    };

    const createNewSchedule = async (editor) => {
        const [startTime, endTime] = editor.timeRange || [];
        if (!startTime || !endTime) {
            return;
        }
        const selectedProject = projectOptions.find((project) => project.value === editor.projectId);
        const temporaryEvent = {
            title: editor.title.trim() || selectedProject?.label || "未命名日程",
            start: startTime.toDate(),
            end: endTime.toDate(),
            extendedProps: {projectId: editor.projectId, description: editor.description},
        };
        try {
            const scheduleEvent = await ScheduleApi.createSchedule(toScheduleParam(temporaryEvent));
            setScheduleEvents((currentEvents) => [...currentEvents, toScheduleEvents([scheduleEvent])[0]]);
        } catch (error) {
            messageApi.error(getErrorMessage(error), 5);
        }
    };

    const openNewEventEditor = (info) => {
        if (!info.view.type.startsWith("timeGrid")) {
            return;
        }
        void saveEvent();
        info.view.calendar.unselect();
        setContextMenu(null);
        setEventEditor({
            isNew: true,
            title: "",
            description: "",
            projectId: undefined,
            originalEvent: {title: "", description: "", projectId: undefined, start: info.start, end: info.end},
            timeRange: [dayjs(info.start), dayjs(info.end)],
            left: Math.max(EDITOR_VIEWPORT_OFFSET, Math.min(info.jsEvent.clientX + EDITOR_VIEWPORT_OFFSET,
                window.innerWidth - EVENT_EDITOR_WIDTH - EDITOR_VIEWPORT_OFFSET)),
            top: Math.max(EDITOR_VIEWPORT_OFFSET, Math.min(info.jsEvent.clientY + EDITOR_VIEWPORT_OFFSET,
                window.innerHeight - EVENT_EDITOR_HEIGHT - EDITOR_VIEWPORT_OFFSET)),
        });
    };

    const deleteEvent = async () => {
        const calendarEvent = contextMenu.calendarEvent;
        setContextMenu(null);
        setEventEditor(null);
        try {
            await ScheduleApi.deleteSchedule(calendarEvent.extendedProps.scheduleId || calendarEvent.id);
            calendarEvent.remove();
            setScheduleEvents((currentEvents) => currentEvents.filter((event) => event.id !== calendarEvent.id));
        } catch (error) {
            messageApi.error(getErrorMessage(error), 5);
        }
    };

    const openDroppedEventEditor = (info) => {
        void saveEvent();
        const eventEnd = info.event.end ? dayjs(info.event.end) : dayjs(info.event.start).add(1, "hour");
        const eventRect = getDroppedEventRect(calendarRef.current?.elRef?.current, info.event.start);
        const editorLeft = eventRect && eventRect.right + EDITOR_VIEWPORT_OFFSET + EVENT_EDITOR_WIDTH <= window.innerWidth
            ? eventRect.right + EDITOR_VIEWPORT_OFFSET
            : (eventRect?.left || window.innerWidth / 2) - EVENT_EDITOR_WIDTH - EDITOR_VIEWPORT_OFFSET;
        info.event.remove();
        setEventEditor({
            isNew: true,
            title: info.event.title,
            description: info.event.extendedProps.description || "",
            projectId: Number(info.event.extendedProps.projectId),
            originalEvent: {title: "", description: "", projectId: undefined, start: info.event.start, end: eventEnd.toDate()},
            timeRange: [dayjs(info.event.start), eventEnd],
            left: Math.max(EDITOR_VIEWPORT_OFFSET, Math.min(editorLeft,
                window.innerWidth - EVENT_EDITOR_WIDTH - EDITOR_VIEWPORT_OFFSET)),
            top: Math.max(EDITOR_VIEWPORT_OFFSET, Math.min((eventRect?.top || window.innerHeight / 2) + EDITOR_VIEWPORT_OFFSET,
                window.innerHeight - EVENT_EDITOR_HEIGHT - EDITOR_VIEWPORT_OFFSET)),
        });
    };

    const updateScheduleTime = async (info) => {
        try {
            const scheduleEvent = await ScheduleApi.updateSchedule(info.event.extendedProps.scheduleId || info.event.id,
                toScheduleParam(info.event));
            replaceScheduleEvent(scheduleEvent);
        } catch (error) {
            info.revert();
            messageApi.error(getErrorMessage(error), 5);
        }
    };

    const updateStatisticsRange = (info) => {
        setStatisticsRange({
            start: dayjs(info.view.currentStart),
            end: dayjs(info.view.currentEnd),
            viewType: info.view.type,
        });
    };

    const openHiddenTimeRangeModal = () => {
        setHiddenTimeRangeEditor(hiddenTimeRange
            ? [toTimePickerValue(hiddenTimeRange.start), toTimePickerValue(hiddenTimeRange.end)]
            : null);
        setIsHiddenTimeRangeModalOpen(true);
    };

    const saveHiddenTimeRange = () => {
        if (!hiddenTimeRangeEditor) {
            localStorage.removeItem(getHiddenTimeRangeStorageKey(user?.name));
            setHiddenTimeRange(null);
            setIsHiddenTimeRangeModalOpen(false);
            return;
        }
        const [startTime, endTime] = hiddenTimeRangeEditor;
        if (!startTime.isBefore(endTime)) {
            messageApi.error("隐藏时间段的结束时间必须晚于开始时间");
            return;
        }
        const timeRange = {start: startTime.format("HH:mm"), end: endTime.format("HH:mm"), enabled: true};
        localStorage.setItem(getHiddenTimeRangeStorageKey(user?.name), JSON.stringify(timeRange));
        setHiddenTimeRange(timeRange);
        setIsHiddenTimeRangeModalOpen(false);
    };

    const setHiddenTimeRangeEnabled = (enabled) => {
        if (!hiddenTimeRange) {
            return;
        }
        const timeRange = {...hiddenTimeRange, enabled};
        localStorage.setItem(getHiddenTimeRangeStorageKey(user?.name), JSON.stringify(timeRange));
        setHiddenTimeRange(timeRange);
    };

    const calendarOptions = {
        plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
        initialView: "timeGridWeek",
        locale: zhCnLocale,
        firstDay: 1,
        headerToolbar: {
            left: "prev,next today hiddenTimeRange",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
        },
        customButtons: {
            hiddenTimeRange: {
                text: "",
                hint: getHiddenTimeRangeHint(hiddenTimeRange),
                click: (event) => {
                    if (!event.target.closest(".schedule-hidden-time-range-checkbox")) {
                        openHiddenTimeRangeModal();
                    }
                },
            },
        },
        editable: true,
        eventResizableFromStart: true,
        eventDisplay: "block",
        droppable: true,
        selectable: true,
        selectMirror: true,
        selectMinDistance: 5,
        slotDuration: "00:30:00",
        slotLabelInterval: "01:00:00",
        views: {
            timeGridWeek: {snapDuration: "00:15:00"},
        },
        slotLaneClassNames: (info) => isHiddenTimeSlot(info.date, hiddenTimeRange)
            ? ["schedule-hidden-time-slot"] : [],
        events: scheduleEvents,
        height: "100%",
        expandRows: true,
        dateClick: () => {
            setContextMenu(null);
            void saveEvent();
        },
        eventClick: openEventEditor,
        select: openNewEventEditor,
        eventReceive: openDroppedEventEditor,
        eventDrop: updateScheduleTime,
        eventResize: updateScheduleTime,
        datesSet: updateStatisticsRange,
        eventDidMount: (info) => {
            info.el.oncontextmenu = (mouseEvent) => {
                mouseEvent.preventDefault();
                void saveEvent();
                setEventEditor(null);
                setContextMenu({
                    calendarEvent: info.event,
                    left: Math.max(8, Math.min(mouseEvent.clientX, window.innerWidth - 112)),
                    top: Math.max(8, Math.min(mouseEvent.clientY, window.innerHeight - 48)),
                });
            };
        },
        eventWillUnmount: (info) => {
            info.el.oncontextmenu = null;
        },
    };

    return (
        <Card className="schedule-page" bordered={false}>
            <div className="schedule-layout">
                <div className="schedule-calendar-wrapper">
                    <FullCalendar ref={calendarRef} {...calendarOptions}/>
                </div>
                <aside className="schedule-sidebar" ref={projectTreeRef}>
                    <div className="schedule-project-tree">
                        <div className="schedule-project-tree-title">项目列表</div>
                        <Tree treeData={projectTree} defaultExpandAll blockNode/>
                    </div>
                    <Card className="schedule-project-time-card" size="small"
                          title={getProjectTimeStatisticsTitle(statisticsRange.viewType)}
                          extra={<Space size={0}>
                              <Tooltip title={projectTimeChartType === "pie" ? "切换为柱状图" : "切换为饼图"}>
                                  <Button type="text" size="small"
                                          icon={projectTimeChartType === "pie" ? <BarChartOutlined/> : <PieChartOutlined/>}
                                          onClick={() => setProjectTimeChartType((currentType) => currentType === "pie" ? "bar" : "pie")}/>
                              </Tooltip>
                              <Tooltip title="放大统计图">
                                  <Button type="text" size="small" icon={<ExpandOutlined/>}
                                          onClick={() => setIsProjectTimeStatisticsModalOpen(true)}/>
                              </Tooltip>
                          </Space>}>
                        <ProjectTimeStatisticsContent data={projectTimeStatistics} totalHours={totalProjectHours}
                                                      chartType={projectTimeChartType}
                                                      totalLabel={getProjectTimeTotalLabel(statisticsRange.viewType)}/>
                    </Card>
                </aside>
            </div>
            {selectionTimePreview && (
                <div className="schedule-selection-time-preview"
                     style={{left: selectionTimePreview.left, top: selectionTimePreview.top}}>
                    {selectionTimePreview.start.format("MM-DD HH:mm")} - {selectionTimePreview.end.format("MM-DD HH:mm")}
                </div>
            )}
            {contextMenu && (
                <div className="schedule-event-context-menu"
                     style={{left: contextMenu.left, top: contextMenu.top}}
                     onClick={(event) => event.stopPropagation()}>
                    <Button type="text" danger size="small" onClick={() => void deleteEvent()}>删除日程</Button>
                </div>
            )}
            {eventEditor && (
                <div className="schedule-event-editor"
                     style={{left: eventEditor.left, top: eventEditor.top}}
                     onClick={(event) => event.stopPropagation()}>
                    <Input className="schedule-event-editor-title"
                           value={eventEditor.title}
                           placeholder="日程名称"
                           onChange={(event) => setEventEditor((currentEditor) => ({
                               ...currentEditor,
                               title: event.target.value,
                           }))}/>
                    <DatePicker.RangePicker className="schedule-event-editor-field"
                                            value={eventEditor.timeRange}
                                            showTime={{format: "HH:mm"}}
                                            format="YYYY-MM-DD HH:mm"
                                            onChange={(timeRange) => timeRange && setEventEditor((currentEditor) => ({
                                                ...currentEditor,
                                                timeRange,
                                            }))}/>
                    <div className="schedule-event-project-field">
                        <span>项目：</span>
                        <ProjectBrowser
                            value={projectOptions.find((project) => project.value === eventEditor.projectId)
                                ? {id: eventEditor.projectId,
                                    name: projectOptions.find((project) => project.value === eventEditor.projectId).label}
                                : null}
                            style={{width: "100%"}}
                            onChange={(project) => setEventEditor((currentEditor) => ({
                                ...currentEditor,
                                projectId: project?.id,
                            }))}/>
                    </div>
                    <Input.TextArea className="schedule-event-editor-field"
                                    value={eventEditor.description}
                                    placeholder="日程描述"
                                    onChange={(event) => setEventEditor((currentEditor) => ({
                                        ...currentEditor,
                               description: event.target.value,
                           }))}/>
                    {eventEditor.isNew && (
                        <Button type="primary" className="schedule-event-editor-confirm"
                                onClick={() => void saveEvent(true)}>确定</Button>
                    )}
                </div>
            )}
            <Modal title="隐藏时间段" open={isHiddenTimeRangeModalOpen} onOk={saveHiddenTimeRange}
                   onCancel={() => setIsHiddenTimeRangeModalOpen(false)} okText="确定" cancelText="取消">
                <TimePicker.RangePicker value={hiddenTimeRangeEditor} format="HH:mm" minuteStep={30}
                                        placeholder={["开始时间", "结束时间"]}
                                        onChange={setHiddenTimeRangeEditor}/>
            </Modal>
            <Modal className="schedule-project-time-modal" open={isProjectTimeStatisticsModalOpen}
                   title={<div className="schedule-project-time-modal-title">
                       <span>{getProjectTimeStatisticsTitle(statisticsRange.viewType)}</span>
                       <Tooltip title={projectTimeChartType === "pie" ? "切换为条形图" : "切换为饼图"}>
                           <Button type="text" icon={projectTimeChartType === "pie" ? <BarChartOutlined/> : <PieChartOutlined/>}
                                   onClick={() => setProjectTimeChartType((currentType) => currentType === "pie" ? "bar" : "pie")}/>
                       </Tooltip>
                   </div>} footer={null} width={760}
                   onCancel={() => setIsProjectTimeStatisticsModalOpen(false)}>
                <ProjectTimeStatisticsContent data={projectTimeStatistics} totalHours={totalProjectHours}
                                              chartType={projectTimeChartType} expanded
                                              totalLabel={getProjectTimeTotalLabel(statisticsRange.viewType)}/>
            </Modal>
        </Card>
    );
};

export default SchedulePage;
