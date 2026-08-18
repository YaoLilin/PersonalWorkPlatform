import {useLoaderData} from "react-router-dom";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin, {Draggable} from "@fullcalendar/interaction";
import zhCnLocale from "@fullcalendar/core/locales/zh-cn";
import {Button, Card, DatePicker, Input, Tree} from "antd";
import {FolderOutlined} from "@ant-design/icons";
import dayjs from "dayjs";
import {useContext, useEffect, useRef, useState} from "react";
import "./schedule.css";
import ScheduleApi from "../../request/scheduleApi";
import {TypeApi} from "../../request/typeApi";
import {ProjectApi} from "../../request/projectApi";
import {MessageContext} from "../../provider/MessageProvider";
import ProjectBrowser from "../../components/public/projectBrowser";

const EVENT_EDITOR_WIDTH = 350;
const EVENT_EDITOR_HEIGHT = 400;
const EDITOR_VIEWPORT_OFFSET = 8;

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
    const projectTreeRef = useRef(null);
    const calendarRef = useRef(null);
    const [contextMenu, setContextMenu] = useState(null);
    const [eventEditor, setEventEditor] = useState(null);

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
        const closeContextMenu = () => setContextMenu(null);
        document.addEventListener("click", closeContextMenu);
        return () => document.removeEventListener("click", closeContextMenu);
    }, []);

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
        const temporaryEvent = {
            title: editor.title.trim() || "未命名日程",
            start: startTime.toDate(),
            end: endTime.toDate(),
            extendedProps: {projectId: editor.projectId, description: editor.description},
        };
        try {
            const scheduleEvent = await ScheduleApi.createSchedule(toScheduleParam(temporaryEvent));
            calendarRef.current?.getApi().addEvent(toScheduleEvents([scheduleEvent])[0]);
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
        } catch (error) {
            messageApi.error(getErrorMessage(error), 5);
        }
    };

    const openDroppedEventEditor = (info) => {
        void saveEvent();
        const eventEnd = info.event.end ? dayjs(info.event.end) : dayjs(info.event.start).add(1, "hour");
        const eventRect = info.el.getBoundingClientRect();
        info.event.remove();
        setEventEditor({
            isNew: true,
            title: info.event.title,
            description: info.event.extendedProps.description || "",
            projectId: Number(info.event.extendedProps.projectId),
            originalEvent: {title: "", description: "", projectId: undefined, start: info.event.start, end: eventEnd.toDate()},
            timeRange: [dayjs(info.event.start), eventEnd],
            left: Math.max(EDITOR_VIEWPORT_OFFSET, Math.min(eventRect.right + EDITOR_VIEWPORT_OFFSET,
                window.innerWidth - EVENT_EDITOR_WIDTH - EDITOR_VIEWPORT_OFFSET)),
            top: Math.max(EDITOR_VIEWPORT_OFFSET, Math.min(eventRect.bottom + EDITOR_VIEWPORT_OFFSET,
                window.innerHeight - EVENT_EDITOR_HEIGHT - EDITOR_VIEWPORT_OFFSET)),
        });
    };

    const updateScheduleTime = async (info) => {
        try {
            await ScheduleApi.updateSchedule(info.event.extendedProps.scheduleId || info.event.id,
                toScheduleParam(info.event));
        } catch (error) {
            info.revert();
            messageApi.error(getErrorMessage(error), 5);
        }
    };

    const calendarOptions = {
        plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
        initialView: "timeGridWeek",
        locale: zhCnLocale,
        firstDay: 1,
        headerToolbar: {
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
        },
        editable: true,
        eventResizableFromStart: true,
        droppable: true,
        selectable: true,
        selectMinDistance: 5,
        slotDuration: "00:30:00",
        slotLabelInterval: "01:00:00",
        events,
        height: "100%",
        dateClick: () => {
            setContextMenu(null);
            void saveEvent();
        },
        eventClick: openEventEditor,
        select: openNewEventEditor,
        eventReceive: openDroppedEventEditor,
        eventDrop: updateScheduleTime,
        eventResize: updateScheduleTime,
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
                <aside className="schedule-project-tree" ref={projectTreeRef}>
                    <div className="schedule-project-tree-title">项目列表</div>
                    <Tree treeData={projectTree} defaultExpandAll blockNode/>
                </aside>
            </div>
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
        </Card>
    );
};

export default SchedulePage;
