import {useEffect, useRef, useState} from "react";
import {createRoot} from "react-dom/client";
import {Draggable} from "@fullcalendar/interaction";
import HiddenTimeRangeButton from "../components/HiddenTimeRangeButton";
import {getPointerScheduleTime, getSelectionTimeRange} from "../utils/scheduleUtils";

/**
 * 管理日历尺寸、侧栏拖拽、滚动、指针预览和工具栏控件。<br>
 * <p>这些监听器与页面业务状态分离，并在对应 DOM 节点卸载时释放。</p>
 *
 * @param {Object} options 日历界面依赖
 * @param {Object} options.calendarRef FullCalendar 引用
 * @param {Object} options.calendarContainerRef 日历容器引用
 * @param {Object} options.projectTreeRef 侧栏引用
 * @param {Object} options.hiddenRange 隐藏时间段状态和操作
 * @param {Function} options.setContextMenu 设置日程右键菜单
 * @returns {Object} 指针选择预览状态
 */
export function useScheduleCalendarEffects({
    calendarRef,
    calendarContainerRef,
    projectTreeRef,
    hiddenRange,
    setContextMenu,
}) {
    const toolbarRootRef = useRef(null);
    const [selectionPreview, setSelectionPreview] = useState(null);

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
    }, [calendarContainerRef, calendarRef]);

    /** 初始化项目树的外部拖拽能力，并在侧栏卸载时销毁实例。 */
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
    }, [projectTreeRef]);

    /** 侧栏滚动时临时显示滚动条，停止滚动后隐藏。 */
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
    }, [projectTreeRef]);

    /** 点击页面其他区域时关闭日程右键菜单。 */
    useEffect(() => {
        const close = () => setContextMenu(null);
        document.addEventListener("click", close);
        return () => document.removeEventListener("click", close);
    }, [setContextMenu]);

    /** 监听日历时间轴上的指针移动，实时生成待创建日程的时间预览。 */
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
    }, [calendarRef]);

    /** 将隐藏时间段控件挂载到 FullCalendar 自定义工具栏按钮。 */
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

    /** 页面卸载时销毁工具栏按钮的独立 React 根节点。 */
    useEffect(() => () => toolbarRootRef.current?.root.unmount(), []);

    return {selectionPreview};
}
