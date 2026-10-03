import dayjs from "dayjs";

/** 将日程按当前周的实际重叠分钟数汇总到项目或清单。 */
export function countWeekTasks(events, weekDate) {
    if (!weekDate) return [];
    const start = dayjs(weekDate).startOf('day').valueOf();
    const end = dayjs(weekDate).add(7, 'day').startOf('day').valueOf();
    const counts = new Map();
    (events || []).forEach(event => {
        const eventStart = dayjs(`${event.date}T${event.startTime}`).valueOf();
        const eventEnd = dayjs(`${event.endDate || event.date}T${event.endTime}`).valueOf();
        const minutes = Math.max(0, Math.round((Math.min(end, eventEnd) - Math.max(start, eventStart)) / 60000));
        if (!minutes) return;
        const isChecklist = event.checklistId != null;
        const id = isChecklist ? event.checklistId : event.projectId;
        if (id == null) return;
        const key = `${isChecklist ? 'checklist' : 'project'}:${id}`;
        const current = counts.get(key);
        if (current) {
            current.minutes += minutes;
        } else {
            counts.set(key, {
                name: isChecklist ? event.checklistName : event.projectName,
                minutes,
                isChecklist,
            });
        }
    });
    return [...counts.values()].sort((a, b) => b.minutes - a.minutes);
}
