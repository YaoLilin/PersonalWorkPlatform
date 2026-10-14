import dayjs from "dayjs";

/**
 * 获取指针对应的日程时间。
 *
 * @param {HTMLElement} element 日历元素
 * @param {PointerEvent} event 指针事件
 * @returns {dayjs.Dayjs|null} 时间
 */
export function getPointerScheduleTime(element, event) {
    const slot = [...element.querySelectorAll(".fc-timegrid-slot-lane[data-time]")].find((item) => {
        const rect = item.getBoundingClientRect();
        return event.clientY >= rect.top && event.clientY < rect.bottom;
    });
    const column = [...element.querySelectorAll(".fc-timegrid-col[data-date]")].find((item) => {
        const rect = item.getBoundingClientRect();
        return event.clientX >= rect.left && event.clientX <= rect.right;
    });
    if (!slot || !column?.dataset.date || !slot.dataset.time) return null;
    const rect = slot.getBoundingClientRect();
    return dayjs(`${column.dataset.date}T${slot.dataset.time}`).add(event.clientY - rect.top >= rect.height / 2 ? 15 : 0, "minute");
}

/**
 * 构建拖动选中范围。
 *
 * @param {dayjs.Dayjs} start 开始时间
 * @param {dayjs.Dayjs} current 当前时间
 * @returns {Object} 时间范围
 */
export function getSelectionTimeRange(start, current) {
    return current.isBefore(start) ? {start: current, end: start.add(15, "minute")} : {
        start,
        end: current.add(15, "minute")
    };
}

/**
 * 获取外部项目拖入后依附的目标单元格。
 *
 * @param {HTMLElement|null} element 日历元素
 * @param {Date} start 事件开始时间
 * @returns {DOMRect|undefined} 单元格区域
 */
export function getDroppedEventRect(element, start) {
    if (!element) return undefined;
    const time = dayjs(start);
    const date = time.format("YYYY-MM-DD");
    const seconds = time.hour() * 3600 + time.minute() * 60 + time.second();
    const slot = [...element.querySelectorAll(".fc-timegrid-slot-lane[data-time]")].reduce((matched, item) => {
        const [hour, minute, second = 0] = item.dataset.time.split(":").map(Number);
        const itemSeconds = hour * 3600 + minute * 60 + second;
        if (itemSeconds > seconds) return matched;
        if (!matched) return item;
        const [matchedHour, matchedMinute, matchedSecond = 0] = matched.dataset.time.split(":").map(Number);
        return itemSeconds > matchedHour * 3600 + matchedMinute * 60 + matchedSecond ? item : matched;
    }, null);
    const column = element.querySelector(`.fc-timegrid-col[data-date="${date}"]`);
    if (slot && column) {
        const slotRect = slot.getBoundingClientRect();
        const columnRect = column.getBoundingClientRect();
        return new DOMRect(columnRect.left, slotRect.top, columnRect.width, slotRect.height);
    }
    return element.querySelector(`.fc-daygrid-day[data-date="${date}"]`)?.getBoundingClientRect();
}
