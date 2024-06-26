import {get} from "./http";

const typeCountOfMonth = (monthId, layer) => get("api/chart/type-time-count-month",null,{monthId, layer});
const typeCountOfWeek = (weekId, layer) => get("api/chart/type-time-count-week",null,{weekId, layer});

const api ={
    typeCountOfMonth,
    typeCountOfWeek
}

export {api as ChartApi}