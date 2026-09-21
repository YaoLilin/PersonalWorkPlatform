import {del, get, post, put} from "./http";

const getChecklists = () => get("/api/checklists");
const addChecklist = (params) => post("/api/checklists", params);
const updateChecklist = (id, params) => put("/api/checklists", id, params);
const updateChecklistState = (id, isDone) => put("/api/checklists/{id}/state", id, {isDone});
const deleteChecklist = (id) => del("/api/checklists", id);
const getTypeTree = () => get("/api/checklist-types/tree");
const addType = (params) => post("/api/checklist-types", params);
const updateType = (id, params) => put("/api/checklist-types", id, params);
const deleteType = (id) => del("/api/checklist-types", id);

export const ChecklistApi = {
    getChecklists,
    addChecklist,
    updateChecklist,
    updateChecklistState,
    deleteChecklist,
    getTypeTree,
    addType,
    updateType,
    deleteType,
};
