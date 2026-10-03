import {useLoaderData, useRevalidator} from "react-router-dom";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin, {Draggable} from "@fullcalendar/interaction";
import zhCnLocale from "@fullcalendar/core/locales/zh-cn";
import {Card, Tabs, Tree} from "antd";
import dayjs from "dayjs";
import {createRoot} from "react-dom/client";
import {useContext, useEffect, useMemo, useRef, useState} from "react";
import "./schedule.css";
import ScheduleApi from "../../request/scheduleApi";
import {TypeApi} from "../../request/typeApi";
import {ProjectApi} from "../../request/projectApi";
import {ChecklistApi} from "../../request/checklistApi";
import {MessageContext} from "@/provider/MessageProvider";
import {UserContext} from "@/provider/UserProvider";
import {ScheduleOverlays} from "./components/ScheduleOverlays";
import ChecklistEditorModal from "../checklist/ChecklistEditorModal";
import HiddenTimeRangeButton from "./components/HiddenTimeRangeButton";
import {ScheduleStatisticsCard} from "./components/ScheduleStatistics";
import {useHiddenTimeRange} from "./hooks/useHiddenTimeRange";
import {useScheduleManagement} from "./hooks/useScheduleManagement";
import {
    getChecklistTypeColors,
    getCurrentWeekRange,
    getHiddenTimeRangeHint,
    getPointerScheduleTime,
    getProjectColors,
    getProjectTimeStatistics,
    getSelectionTimeRange,
    INBOX_CHECKLIST_TYPE_KEY,
    isHiddenTimeSlot,
    toChecklistTree,
    toProjectTree,
    toScheduleEvents,
    toScheduleParam
} from "./utils/scheduleUtils";

/**
 * 获取清单树中初始展开的分类节点。
 *
 * @param {Array} nodes 清单树节点
 * @returns {Array<string>} 分类节点键值
 */
function getChecklistGroupKeys(nodes) {
    return nodes.flatMap((node) => node.isLeaf ? [] : [node.key, ...getChecklistGroupKeys(node.children || [])]);
}

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
    const toolbarRootRef = useRef(null);
    const hiddenRange = useHiddenTimeRange({userName: user?.name, messageApi});
    const [expandedChecklistKeys, setExpandedChecklistKeys] = useState(() => getChecklistGroupKeys(checklistTree));
    const schedule = useScheduleManagement({
        calendarRef,
        projectOptions,
        checklists,
        messageApi,
        initialEvents: events,
        checklistTypeColors,
        projectColors,
        onChecklistCreated: () => {
            setExpandedChecklistKeys((keys) => keys.includes(INBOX_CHECKLIST_TYPE_KEY)
                ? keys : [...keys, INBOX_CHECKLIST_TYPE_KEY]);
            revalidate();
        },
        onChecklistChanged: revalidate,
    });
    const [selectionPreview, setSelectionPreview] = useState(null);
    const [sidebarTab, setSidebarTab] = useState("checklists");
    const [editingChecklist, setEditingChecklist] = useState(null);
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

    /** 菜单收起或展开改变日历容器宽度时，重新计算 FullCalendar 的列宽。 */
    useEffect(() => {
        const container = calendarContainerRef.current;
        if (!container) return undefined;
        let frame;
        let previousWidth;
        const observer = new ResizeObserver(([entry]) => {
            const width = entry.contentRect.width;
            if (width === previousWidth) return;
            previousWidth = width;
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(() => calendarRef.current?.getApi()?.updateSize());
        });
        observer.observe(container);
        return () => {
            observer.disconnect();
            cancelAnimationFrame(frame);
        };
    }, []);

    /**
     * 初始化项目树的外部拖拽能力，并在组件卸载时销毁拖拽实例。
     */
    useEffect(() => {
        if (!projectTreeRef.current) return undefined;
        const draggable = new Draggable(projectTreeRef.current, {
            itemSelector: ".schedule-project-item, .schedule-checklist-item",
            eventData: (element) => ({
                title: element.dataset.scheduleName || element.dataset.projectName,
                duration: "01:00",
                backgroundColor: element.dataset.scheduleColor,
                borderColor: element.dataset.scheduleColor,
                textColor: element.dataset.scheduleTextColor || "#fff",
                extendedProps: {
                    projectId: element.dataset.projectId || undefined,
                    checklistId: element.dataset.checklistId || undefined,
                }
            })
        });
        return () => draggable.destroy();
    }, []);

    /**
     * 侧栏清单与项目列表滚动时临时显示滚动条，停止滚动后隐藏。
     */
    useEffect(() => {
        const holder = projectTreeRef.current?.querySelector(".ant-tabs-content-holder");
        if (!holder) return undefined;
        let hideTimer;
        const showScrollbar = () => {
            holder.classList.add("is-scrolling");
            clearTimeout(hideTimer);
            hideTimer = window.setTimeout(() => holder.classList.remove("is-scrolling"), 700);
        };
        holder.addEventListener("scroll", showScrollbar, {passive: true});
        return () => {
            holder.removeEventListener("scroll", showScrollbar);
            clearTimeout(hideTimer);
        };
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
    const openChecklistEditor = (_, info) => {
        if (info.node.checklist) setEditingChecklist(info.node.checklist);
    };
    const updateScheduleTime = async (scheduleTimeId, range, checklistName) => {
        const event = schedule.scheduleEvents.find((item) => item.id === String(scheduleTimeId));
        if (!event) throw new Error("关联日程不存在，请刷新页面后重试");
        await ScheduleApi.updateSchedule(scheduleTimeId, {
            ...toScheduleParam({...event, start: range[0].toDate(), end: range[1].toDate()}),
            scheduleName: checklistName,
        });
        revalidate();
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
                    <div className="schedule-project-tree">
                        <Tabs
                            activeKey={sidebarTab}
                            onChange={setSidebarTab}
                            items={[
                                {
                                    key: "checklists",
                                    label: "清单列表",
                                    children: <Tree
                                        treeData={checklistTree}
                                        expandedKeys={expandedChecklistKeys}
                                        onExpand={setExpandedChecklistKeys}
                                        autoExpandParent={false}
                                        blockNode
                                        onSelect={openChecklistEditor}
                                    />,
                                },
                                {
                                    key: "projects",
                                    label: "项目列表",
                                    children: <Tree treeData={projectTree} defaultExpandAll blockNode/>,
                                },
                            ]}
                        />
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
                checklist={checklists.find((item) => item.id === schedule.eventEditor?.checklistId)}
                checklistTypeTree={checklistTypeTree}
                projectOptions={projectOptions}
                setEditor={schedule.setEventEditor}
                onSaveEditor={() => void schedule.saveEditor(true)}
                onToggleChecklistState={toggleChecklistState}
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
            <ChecklistEditorModal
                open={Boolean(editingChecklist)}
                checklist={editingChecklist}
                projects={projects}
                typeTree={checklistTypeTree}
                onCancel={() => setEditingChecklist(null)}
                onChanged={revalidate}
                onUpdateScheduleTime={updateScheduleTime}
            />
        </Card>
    );
};

export default SchedulePage;
