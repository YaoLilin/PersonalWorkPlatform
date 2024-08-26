
import {get,post,put,del} from './http'

const getProjects = params => get('/api/projects',null,params);

const getProject = id => get('/api/projects',id);

const addProject = params => post('/api/projects',params);

const deleteProject = ids => del('/api/projects',ids);

const updateProject = (id,params) => put('/api/projects',id,params);

const existRecord = (id) =>  get('/api/projects/{id}/exist-record',id);

const apis ={
    getProjects,
    getProject,
    addProject,
    deleteProject,
    updateProject,
    existRecord
}

export {apis as ProjectApi} ;