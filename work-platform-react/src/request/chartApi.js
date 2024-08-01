import {get} from "./http";

const typeCountOfMonth = (monthId, layer) => get("api/chart/type-time-count-month",null,{monthId, layer});
const typeCountOfWeek = (weekId, layer) => get("api/chart/type-time-count-week",null,{weekId, layer});
const weekTimeCount = (params) => get("api/chart/week-time-count", null, params);
const monthTimeCount = (params) => get("api/chart/month-time-count", null, params);
const workTimeProportion = (params) => get("api/chart/work-time-proportion", null, params);

const api ={
    typeCountOfMonth,
    typeCountOfWeek,
    weekTimeCount,
    monthTimeCount,
    workTimeProportion
}

export {api as ChartApi}