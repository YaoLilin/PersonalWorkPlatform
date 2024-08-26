
import {get,post,put,del} from './http'
const getTypes = params => get('/api/types',null,params);

const getTypeTree =params => get('/api/types/tree',null,params);

const addType = params => post('/api/types',params);

const deleteType = (ids,params) => del('/api/types',ids,params);

const updateType = (id,params) => put('/api/types',id,params);

const apis ={
    getTypes,
    getTypeTree,
    addType,
    deleteType,
    updateType,
}

export {apis as TypeApi} ;