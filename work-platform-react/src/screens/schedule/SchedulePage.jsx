import {useLoaderData} from "react-router-dom";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin, {Draggable} from "@fullcalendar/interaction";
import zhCnLocale from "@fullcalendar/core/locales/zh-cn";
import {Card, Checkbox, Tree} from "antd";
import {ClockCircleOutlined} from "@ant-design/icons";
import dayjs from "dayjs";
import {createRoot} from "react-dom/client";
import {useContext, useEffect, useMemo, useRef, useState} from "react";
import "./schedule.css";
import ScheduleApi from "../../request/scheduleApi";
import {TypeApi} from "../../request/typeApi";
import {ProjectApi} from "../../request/projectApi";
import {MessageContext} from "@/provider/MessageProvider";
import {UserContext} from "@/provider/UserProvider";
import {ScheduleOverlays} from "./components/ScheduleOverlays";
import {ScheduleStatisticsCard} from "./components/ScheduleStatistics";
import {useHiddenTimeRange} from "./hooks/useHiddenTimeRange";
import {useScheduleManagement} from "./hooks/useScheduleManagement";
import {
    getCurrentWeekRange,
    getHiddenTimeRangeHint,
    getPointerScheduleTime,
    getProjectTimeStatistics,
    getSelectionTimeRange,
    isHiddenTimeSlot,
    toProjectTree,
    toScheduleEvents
} from "./utils/scheduleUtils";

/**
 * 隐藏时间段工具栏内容。
 *
 * @param {{range: Object|null, onEnabledChange: Function}} props 时间段参数
 * @param {Object|null} props.range 当前隐藏时间段设置
 * @param {string} props.range.start 隐藏时间段的开始时间
 * @param {string} props.range.end 隐藏时间段的结束时间
 * @param {boolean} props.range.enabled 是否启用隐藏时间段
 * @param {Function} props.onEnabledChange 切换隐藏时间段启用状态的回调
 * @returns {JSX.Element} 按钮内容
 */
const HiddenTimeRangeButton = ({range, onEnabledChange}) => (
    <span className="schedule-hidden-time-range-button-content">
        <ClockCircleOutlined/>
        {range && (
            <>
                <span>{range.start} - {range.end}</span>
                <Checkbox className="schedule-hidden-time-range-checkbox" checked={range.enabled}
                          onChange={(event) => onEnabledChange(event.target.checked)}/>
            </>
        )}
    </span>
);

/**
 * 加载日程页面所需的事件和项目数据。
 *
 * @returns {Promise<Object>} 页面初始化数据
 */
export async function loader() {
    const [projectTimes,
        typeTree, projects] =
        await Promise.all([ScheduleApi.getSchedule(), TypeApi.getTypeTree({}), ProjectApi.getProjects({})]);
    const activeProjects = projects.filter((project) => project.state === 1);
    return {
        events: toScheduleEvents(projectTimes),
        projectTree: toProjectTree(typeTree, activeProjects),
        projectOptions: activeProjects.map((project) => ({value: project.id, label: project.name}))
    };
}

/**
 * 日程页面。<br>
 * <p>提供日程的查看、维护、项目拖入及时间统计功能。</p>
 *
 * @returns {JSX.Element} 页面内容
 */
const SchedulePage = () => {
    const {events, projectTree, projectOptions} = useLoaderData();
    const messageApi = useContext(MessageContext);
    const {user} = useContext(UserContext);
    const calendarRef = useRef(null);
    const projectTreeRef = useRef(null);
    const toolbarRootRef = useRef(null);
    const hiddenRange = useHiddenTimeRange({userName: user?.name, messageApi});
    const schedule = useScheduleManagement({calendarRef, projectOptions,
        messageApi, initialEvents: events});
    const [selectionPreview, setSelectionPreview] = useState(null);
    const [chartType, setChartType] = useState("pie");
    const [isStatisticsOpen, setIsStatisticsOpen] = useState(false);
    const [statisticsRange, setStatisticsRange] = useState(() => ({
        ...getCurrentWeekRange(),
        viewType: "timeGridWeek"
    }));
    const statistics = useMemo(() =>
        getProjectTimeStatistics(schedule.scheduleEvents, statisticsRange),
        [schedule.scheduleEvents, statisticsRange]);
    const totalHours = statistics.reduce((sum, item) => sum + item.value, 0);

    /**
     * 初始化项目树的外部拖拽能力，并在组件卸载时销毁拖拽实例。
     */
    useEffect(() => {
        if (!projectTreeRef.current) return undefined;
        const draggable = new Draggable(projectTreeRef.current, {
            itemSelector: ".schedule-project-item",
            eventData: (element) => ({
                title: element.dataset.projectName,
                duration: "01:00",
                extendedProps: {projectId: element.dataset.projectId}
            })
        });
        return () => draggable.destroy();
    }, []);

    /**
     * 监听文档点击事件，在点击页面其他区域时关闭日程右键菜单。
     */
    useEffect(() => {
        const close = () => schedule.setContextMenu(null);
        document.addEventListener("click", close);
        return () => document.removeEventListener("click", close);
    }, [schedule]);

    /**
     * 监听日历时间轴的指针拖动，实时展示待创建日程的时间范围预览。
     */
    useEffect(() => {
        const element = calendarRef.current?.elRef?.current;
        if (!element) return undefined;
        let start = null;
        const down = (event) => {
            if (event.target instanceof Element && event.target.closest(".fc-event")) {
                return;
            }
            start = getPointerScheduleTime(element, event);
        };
        const move = (event) => {
            if (!start) return;
            const current = getPointerScheduleTime(element, event);
            if (current) setSelectionPreview({
                ...getSelectionTimeRange(start, current),
                left: event.clientX + 12,
                top: event.clientY + 12
            });
        };
        const clear = () => {
            start = null;
            setSelectionPreview(null);
        };
        element.addEventListener("pointerdown", down);
        element.addEventListener("pointermove", move);
        document.addEventListener("pointerup", clear);
        return () => {
            element.removeEventListener("pointerdown", down);
            element.removeEventListener("pointermove", move);
            document.removeEventListener("pointerup", clear);
        };
    }, []);

    /**
     * 将隐藏时间段的 React 控件挂载到 FullCalendar 自定义工具栏按钮。
     */
    useEffect(() => {
        const button = calendarRef.current?.elRef?.current?.querySelector(".fc-hiddenTimeRange-button");
        if (!button) return;
        if (toolbarRootRef.current?.button !== button) {
            toolbarRootRef.current?.root.unmount();
            toolbarRootRef.current = {button, root: createRoot(button)};
        }
        toolbarRootRef.current.root.render(
            <HiddenTimeRangeButton range={hiddenRange.range} onEnabledChange={hiddenRange.setEnabled}/>,
        );
    });

    /**
     * 页面卸载时销毁工具栏按钮的独立 React 根节点，避免残留 DOM 引用。
     */
    useEffect(() => () => toolbarRootRef.current?.root.unmount(), []);

    const calendarOptions = {
        plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
        initialView: "timeGridWeek",
        locale: zhCnLocale,
        firstDay: 1,
        headerToolbar: {
            left: "prev,next today hiddenTimeRange",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay"
        },
        customButtons: {
            hiddenTimeRange: {
                text: "", hint: getHiddenTimeRangeHint(hiddenRange.range), click: (event) => {
                    if (!event.target.closest(".schedule-hidden-time-range-checkbox")) hiddenRange.open();
                }
            }
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
        views: {timeGridWeek: {snapDuration: "00:15:00"}},
        slotLaneClassNames: (info) => isHiddenTimeSlot(info.date, hiddenRange.range) ? ["schedule-hidden-time-slot"] : [],
        events: schedule.scheduleEvents,
        height: "100%",
        expandRows: true,
        dateClick: () => {
            schedule.setContextMenu(null);
            void schedule.saveEditor();
        },
        eventClick: schedule.openEditor,
        select: schedule.openNewEditor,
        eventReceive: schedule.openDroppedEditor,
        eventDrop: schedule.updateTime,
        eventResize: schedule.updateTime,
        datesSet: (info) => setStatisticsRange({
            start: dayjs(info.view.currentStart),
            end: dayjs(info.view.currentEnd),
            viewType: info.view.type
        }),
        eventDidMount: (info) => {
            info.el.oncontextmenu = (event) => schedule.openContextMenu(event, info.event);
        },
        eventWillUnmount: (info) => {
            info.el.oncontextmenu = null;
        }
    };
    const toggleChart = () => setChartType((current) => current === "pie" ? "bar" : "pie");
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
                    <ScheduleStatisticsCard
                        data={statistics}
                        totalHours={totalHours}
                        viewType={statisticsRange.viewType}
                        chartType={chartType}
                        onChartTypeChange={toggleChart}
                        onExpand={() => setIsStatisticsOpen(true)}
                    />
                </aside>
            </div>
            <ScheduleOverlays
                selectionPreview={selectionPreview}
                contextMenu={schedule.contextMenu}
                onDelete={() => void schedule.deleteEvent()}
                editor={schedule.eventEditor}
                projectOptions={projectOptions}
                setEditor={schedule.setEventEditor}
                onSaveEditor={() => void schedule.saveEditor(true)}
                isHiddenRangeOpen={hiddenRange.isOpen}
                hiddenRangeEditor={hiddenRange.editor}
                setHiddenRangeEditor={hiddenRange.setEditor}
                onSaveHiddenRange={hiddenRange.save}
                onCloseHiddenRange={hiddenRange.close}
                isStatisticsOpen={isStatisticsOpen}
                onCloseStatistics={() => setIsStatisticsOpen(false)}
                statistics={statistics}
                totalHours={totalHours}
                viewType={statisticsRange.viewType}
                chartType={chartType}
                onChartTypeChange={toggleChart}
            />
        </Card>
    );
};

export default SchedulePage;
