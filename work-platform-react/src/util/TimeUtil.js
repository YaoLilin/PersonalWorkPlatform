
/**
 * 时间计算，得到两个时间相差的分钟
 * @param startTime 格式：hh:mm
 * @param endTime 格式：hh:mm
 * @returns {number|*} 分钟
 */
function getMinutes(startTime, endTime) {
    if (startTime === '' || endTime === '') {
        return 0;
    }
    const stTime = startTime.split(':');
    const edTime = endTime.split(':');
    stTime[0] = Number(stTime[0]);
    stTime[1] = Number(stTime[1]);
    edTime[0] = Number(edTime[0]);
    edTime[1] = Number(edTime[1]);
    let min;
    let hour;
    if (edTime[0] < stTime[0]) {
        hour = 24 - stTime[0] + edTime[0];
    } else {
        hour = edTime[0] - stTime[0];
    }
    if (edTime[1] - stTime[1] < 0) {
        hour--;
        min = 60 - stTime[1] + edTime[1];
    } else {
        min = edTime[1] - stTime[1];
    }
    return 60 * hour + min;
}

export default getMinutes;