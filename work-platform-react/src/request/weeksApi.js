
import {get,post,del,put} from './http'

const saveForm = (id,params) => put('/api/statistics/weeks',id,params);
const createForm = (params) => post('/api/statistics/weeks', params);
const getForm = id => get('/api/statistics/weeks',id);
const getWeekList = params => get('/api/statistics/weeks',null,params);

const getWeek = id => get('/api/statistics/weeks',id);
const weekExists = date => get('/api/statistics/weeks/is-exists',null,{date});
const deleteRecord = id => del('/api/statistics/weeks',id);

const apis ={
    saveForm,
    createForm,
    getWeekList,
    getWeek,
    getForm,
    weekExists,
    deleteRecord,
}

export {apis as WeeksApi}