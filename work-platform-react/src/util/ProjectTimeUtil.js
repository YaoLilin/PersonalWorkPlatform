import getMinutes from "./TimeUtil";

/**
 * 统计表格中每个项目中的进行时间以及占比
 * @param tableData 表格数据
 * @returns {[name:text,minutes:number,projectId:number]}
 */
function merger(tableData) {
    const mergeData = new Map();
    tableData && tableData.forEach(item => {
        if (item.project.value !== -1 && item.project.value !== null && item.project.value !== undefined) {
            if (!mergeData.has(item.project.value)) {
                const rowData = {
                    project: item.project,
                    minutes: getMinutes(item.startTime, item.endTime),
                    hours: Number((getMinutes(item.startTime, item.endTime) / 60).toFixed(2)),
                }
                mergeData.set(item.project.value, rowData);
            } else {
                const projectItem = mergeData.get(item.project.value);
                projectItem.minutes += getMinutes(item.startTime, item.endTime);
                projectItem.hours = Number((projectItem.minutes / 60).toFixed(2));
            }
        }
    });

    const countData = [];
    mergeData.forEach(item => {
        countData.push({name: item.project.showName, minutes: item.minutes, projectId: item.project.value});
    })

    return countData;
}

export {merger}