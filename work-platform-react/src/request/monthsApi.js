import {get,post,put} from './http'

const getMonthList = () => get('/api/statistics/months');
const reCount = () => put('/api/statistics/months/recount')
const getMonth = id => get('/api/statistics/months', id);
const saveForm = (id,params) => put('/api/statistics/months',id,params)

const apis ={
    getMonthList,
    reCount,
    getMonth,
    saveForm
}

export {apis as MonthsApi}
