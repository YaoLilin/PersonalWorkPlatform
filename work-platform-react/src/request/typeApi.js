
import {get,post,put,del} from './http'
export const getTypes = params => get('api/types',null,params);

export const getTypeTree =params => get('api/types/tree',null,params);

export const addType = params => post('api/types',params);

export const deleteType = (ids,params) => del('api/types',ids,params);

export const updateType = (id,params) => put('api/types',id,params);

const apis ={
    getTypes,
    getTypeTree,
    addType,
    deleteType,
    updateType,
}

export {apis as TypeApi} ;