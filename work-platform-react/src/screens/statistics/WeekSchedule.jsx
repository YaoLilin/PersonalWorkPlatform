import React, {useContext, useEffect, useMemo, useRef} from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import zhCnLocale from "@fullcalendar/core/locales/zh-cn";
import {createRoot} from "react-dom/client";
import {MessageContext} from "../../provider/MessageProvider";
import {UserContext} from "../../provider/UserProvider";
import HiddenTimeRangeButton from "../schedule/components/HiddenTimeRangeButton";
import HiddenTimeRangeModal from "../schedule/components/HiddenTimeRangeModal";
import {useHiddenTimeRange} from "../schedule/hooks/useHiddenTimeRange";
import {getHiddenTimeRangeHint, isHiddenTimeSlot, toScheduleEvents,} from "../schedule/utils/scheduleUtils";
import "../schedule/schedule.css";

/**
 * <p>周表单中的只读日程视图。</p>
 *
 * @param {Object} props 组件参数
 * @param {string} props.weekDate 周起始日期
 * @param {Array} props.scheduleEvents 日程接口返回的事件数据
 * @param {Object} props.projectColors 项目编号到有效颜色的映射
 * @param {Object} props.checklistTypeColors 清单编号到类型颜色的映射
 * @returns {JSX.Element} 固定为周视图的日程组件
 */
const WeekSchedule = ({weekDate, scheduleEvents, projectColors, checklistTypeColors}) => {
    const messageApi = useContext(MessageContext);
    const {user} = useContext(UserContext);
    const calendarRef = useRef(null);
    const toolbarRootRef = useRef(null);
    const hiddenRange = useHiddenTimeRange({userName: user?.name, messageApi});
    const events = useMemo(() => toScheduleEvents(scheduleEvents || [], checklistTypeColors, projectColors),
        [scheduleEvents, checklistTypeColors, projectColors]);

    /**
     * 跟随表单周次切换日程视图，始终展示对应周。
     */
    useEffect(() => {
        if (weekDate) {
            calendarRef.current?.getApi()?.gotoDate(weekDate);
        }
    }, [weekDate]);

    /**
     * 将隐藏时间段控件挂载到周日历工具栏，并同步共享的用户设置。
     */
    useEffect(() => {
        const button = calendarRef.current?.elRef?.current?.querySelector(".fc-hiddenTimeRange-button");
        if (!button) {
            return;
        }
        if (toolbarRootRef.current?.button !== button) {
            toolbarRootRef.current?.root.unmount();
            toolbarRootRef.current = {button, root: createRoot(button)};
        }
        toolbarRootRef.current.root.render(
            <HiddenTimeRangeButton range={hiddenRange.range} onEnabledChange={hiddenRange.setEnabled}/>,
        );
    });

    /**
     * 组件卸载时销毁工具栏中的独立 React 根节点。
     */
    useEffect(() => () => toolbarRootRef.current?.root.unmount(), []);

    return (
        <div className="week-schedule">
            <div className="schedule-calendar-wrapper">
                <FullCalendar
                    ref={calendarRef}
                    plugins={[timeGridPlugin]}
                    initialView="timeGridWeek"
                    initialDate={weekDate || undefined}
                    locale={zhCnLocale}
                    firstDay={1}
                    headerToolbar={{left: "hiddenTimeRange", center: "", right: ""}}
                    customButtons={{
                        hiddenTimeRange: {
                            text: "",
                            hint: getHiddenTimeRangeHint(hiddenRange.range),
                            click: (event) => {
                                if (!event.target.closest(".schedule-hidden-time-range-checkbox")) {
                                    hiddenRange.open();
                                }
                            },
                        },
                    }}
                    eventDisplay="block"
                    slotDuration="00:30:00"
                    slotLabelInterval="01:00:00"
                    views={{timeGridWeek: {snapDuration: "00:15:00"}}}
                    slotLaneClassNames={(info) => isHiddenTimeSlot(info.date, hiddenRange.range)
                        ? ["schedule-hidden-time-slot"] : []}
                    events={events}
                    editable={false}
                    eventStartEditable={false}
                    eventDurationEditable={false}
                    droppable={false}
                    selectable={false}
                    height="100%"
                    expandRows
                />
            </div>
            <HiddenTimeRangeModal
                open={hiddenRange.isOpen}
                value={hiddenRange.editor}
                onChange={hiddenRange.setEditor}
                onSave={hiddenRange.save}
                onClose={hiddenRange.close}
            />
        </div>
    );
};

export default WeekSchedule;
