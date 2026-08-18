import {del, get, post, put} from "./http";

/**
 * 获取全部日程。
 *
 * @returns {Promise<Array>} 日程列表
 */
const getSchedule = () => get("/api/schedule");

/**
 * 新增日程。
 *
 * @param {Object} params 日程参数
 * @returns {Promise<Object>} 已新增日程
 */
const createSchedule = (params) => post("/api/schedule", params);

/**
 * 修改日程。
 *
 * @param {number} id 日程编号
 * @param {Object} params 日程参数
 * @returns {Promise<Object>} 已更新日程
 */
const updateSchedule = (id, params) => put("/api/schedule", id, params);

/**
 * 删除日程。
 *
 * @param {number} id 日程编号
 * @returns {Promise<boolean>} 删除结果
 */
const deleteSchedule = (id) => del("/api/schedule", id);

const ScheduleApi = {
    getSchedule,
    createSchedule,
    updateSchedule,
    deleteSchedule,
};

export default ScheduleApi;
