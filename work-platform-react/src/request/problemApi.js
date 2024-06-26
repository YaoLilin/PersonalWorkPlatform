
import {get,post,put,del} from './http'

const list = params => get("/api/problems",null,params);
const isExist = title => get("/api/problems/is-exist",null,{title});
const add = params => post("/api/problems",params);
const otherProblems = weekId => get("/api/problems/other-problems",null,{weekId})
const deleteProblems = (resourceId,params) => del("/api/problems",resourceId,params);
const updateProblems = (resourceId,params) => put("/api/problems",resourceId,params);
const done = (resourceId,params) => put("/api/problems/{id}/done",resourceId,params);
const callback = (resourceId,params) => put("/api/problems/{id}/callback",resourceId,params);

const apis={
    add,
    list,
    otherProblems,
    deleteProblems,
    updateProblems,
    done,
    callback,
    isExist
}

export {apis as ProblemsApis}