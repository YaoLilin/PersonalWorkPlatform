import {useLoaderData, useRevalidator} from "react-router-dom";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import zhCnLocale from "@fullcalendar/core/locales/zh-cn";
import {Card} from "antd";
import dayjs from "dayjs";
import {useContext, useRef, useState} from "react";
import "./schedule.css";
import {TypeApi} from "../../request/typeApi";
import {ProjectApi} from "../../request/projectApi";
import {ChecklistApi} from "../../request/checklistApi";
import {MessageContext} from "@/provider/MessageProvider";
import {UserContext} from "@/provider/UserProvider";
import {ScheduleOverlays} from "./components/ScheduleOverlays";
import ScheduleSidebarTree from "./components/ScheduleSidebarTree";
import {ScheduleStatistics} from "./components/ScheduleStatistics";
import HiddenTimeRangeModal from "./components/HiddenTimeRangeModal";
import {useHiddenTimeRange} from "./hooks/useHiddenTimeRange";
import {useScheduleCalendarEffects} from "./hooks/useScheduleCalendarEffects";
import {useScheduleManagement} from "./hooks/useScheduleManagement";
import {
    getChecklistTypeColors,
    getCurrentWeekRange,
    getHiddenTimeRangeHint,
    getProjectColors,
    isHiddenTimeSlot,
    toChecklistTree,
    toProjectTree,
    toScheduleEvents,
} from "./utils/scheduleUtils";

/**
 * 加载日程页面所需的事件和项目数据。
 *
 * @returns {Promise<Object>} 页面初始化数据
 */
export async function loader() {
    const [projectTimes, typeTree, projects, checklistTypeTree, checklists] = await Promise.all([
        ScheduleApi.getSchedule(),
        TypeApi.getTypeTree({}),
        ProjectApi.getProjects({}),
        ChecklistApi.getTypeTree(),
        ChecklistApi.getChecklists(),
    ]);
    const activeProjects = projects.filter((project) => project.state === 1);
    const projectColors = getProjectColors(typeTree, projects);
    const checklistTypeColors = getChecklistTypeColors(checklistTypeTree, checklists);
    return {
        events: toScheduleEvents(projectTimes, checklistTypeColors, projectColors),
        projectTree: toProjectTree(typeTree, activeProjects, projectColors),
        projectOptions: projects.map((project) => ({value: project.id, label: project.name})),
        projects,
        checklistTypeTree,
        checklistTypeColors,
        projectColors,
        checklistTree: toChecklistTree(checklistTypeTree, checklists.filter((item) => item.isDone !== 1),
            checklistTypeColors, projectColors),
        checklists,
    };
}

/**
 * 日程页面。<br>
 * <p>提供日程的查看、维护、项目拖入及时间统计功能。</p>
 *
 * @returns {JSX.Element} 页面内容
 */
const SchedulePage = () => {
    const {events, projectTree, projectOptions, projects, checklistTree, checklistTypeTree, checklistTypeColors,
        projectColors, checklists} = useLoaderData();
    const {revalidate} = useRevalidator();
    const messageApi = useContext(MessageContext);
    const {user} = useContext(UserContext);
    const calendarRef = useRef(null);
    const calendarContainerRef = useRef(null);
    const projectTreeRef = useRef(null);
    const sidebarTreeRef = useRef(null);
    const hiddenRange = useHiddenTimeRange({userName: user?.name, messageApi});
    const schedule = useScheduleManagement({
        calendarRef,
        projectOptions,
        checklists,
        messageApi,
        initialEvents: events,
        checklistTypeColors,
        projectColors,
        onChecklistCreated: () => {
            sidebarTreeRef.current?.expandInbox();
            revalidate();
        },
        onChecklistChanged: revalidate,
    });
    const {selectionPreview} = useScheduleCalendarEffects({
        calendarRef,
        calendarContainerRef,
        projectTreeRef,
        hiddenRange,
        setContextMenu: schedule.setContextMenu,
    });
    const [statisticsRange, setStatisticsRange] = useState(() => ({
        ...getCurrentWeekRange(),
        viewType: "timeGridWeek"
    }));
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
    const toggleChecklistState = async (checklistId, checked) => {
        try {
            await ChecklistApi.updateChecklistState(checklistId, checked ? 1 : 0);
            revalidate();
        } catch (error) {
            messageApi.error(error?.response?.data?.message || error?.message || "清单状态保存失败", 5);
        }
    };
    return (
        <Card className="schedule-page" bordered={false}>
            <div className="schedule-layout">
                <div className="schedule-calendar-wrapper" ref={calendarContainerRef}>
                    <FullCalendar ref={calendarRef} {...calendarOptions}/>
                </div>
                <aside className="schedule-sidebar" ref={projectTreeRef}>
                    <ScheduleSidebarTree
                        ref={sidebarTreeRef}
                        checklistTree={checklistTree}
                        projectTree={projectTree}
                        projects={projects}
                        checklistTypeTree={checklistTypeTree}
                        scheduleEvents={schedule.scheduleEvents}
                        onChanged={revalidate}
                    />
                    <ScheduleStatistics events={schedule.scheduleEvents} range={statisticsRange}/>
                </aside>
            </div>
            <ScheduleOverlays
                selectionPreview={selectionPreview}
                schedule={schedule}
                checklist={checklists.find((item) => item.id === schedule.eventEditor?.checklistId)}
                checklistTypeTree={checklistTypeTree}
                projectOptions={projectOptions}
                onToggleChecklistState={toggleChecklistState}
            />
            <HiddenTimeRangeModal
                open={hiddenRange.isOpen}
                value={hiddenRange.editor}
                onChange={hiddenRange.setEditor}
                onSave={hiddenRange.save}
                onClose={hiddenRange.close}
            />
        </Card>
    );
};

export default SchedulePage;
