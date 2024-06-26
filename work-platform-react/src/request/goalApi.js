import {get,post,put,del} from "./http";

const getWeekGoals =(params) => get("api/week-goals",null,params);
const addWeekGoals = (param) => post("api/week-goals", param);
const changeWeekGoalState = (id, state) => put("api/week-goals/{id}/change-state",id,{id,state});
const batchWeekGoalDelete = (ids) => del("/api/week-goals",ids);
const getMonthGoals =(params) => get("api/month-goals",null,params);
const addMonthGoals = (param) => post("api/month-goals", param);
const changeMonthGoalState = (id, state) => put("api/month-goals/{id}/change-state",id,{id,state});
const batchMonthGoalDelete = (ids) => del("/api/month-goals",ids);

const goalApi={
    getWeekGoals,
    addWeekGoals,
    changeWeekGoalState,
    batchWeekGoalDelete,
    getMonthGoals,
    addMonthGoals,
    changeMonthGoalState,
    batchMonthGoalDelete
}

export default goalApi;