const ONLY_CURRENT_TYPE_STORAGE_PREFIX = "project-only-current-type";

export const DEFAULT_PROJECT_DATA = {
    name: "",
    type: "",
    progress: "",
    state: "",
    important: "",
    color: null,
    startDate: "",
    endDate: "",
    closeDate: "",
};

const PROJECT_STATE_ORDER = {1: 0, 0: 1, 2: 2};

/**
 * <p>获取当前用户“仅查看当前类型”设置的本地存储键。</p>
 *
 * @param {string | undefined} userName 用户名
 * @returns {string} 本地存储键
 */
export function getOnlyCurrentTypeStorageKey(userName) {
    return `${ONLY_CURRENT_TYPE_STORAGE_PREFIX}-${userName || "anonymous"}`;
}

/**
 * <p>获取当前用户保存的“仅查看当前类型”设置。</p>
 *
 * @param {string | undefined} userName 用户名
 * @returns {boolean} 是否只查看当前类型
 */
export function getOnlyCurrentTypeSetting(userName) {
    return localStorage.getItem(getOnlyCurrentTypeStorageKey(userName)) === "true";
}

/**
 * <p>获取类型节点的全部后代标识。</p>
 *
 * @param {Array} types 类型节点列表
 * @returns {string[]} 后代类型标识
 */
function getDescendantTypeIds(types) {
    return types.flatMap((type) => [String(type.key), ...getDescendantTypeIds(type.children || [])]);
}

/**
 * <p>获取指定类型及其全部子类型的标识。</p>
 *
 * @param {Array} types 类型树
 * @param {string | number} typeId 目标类型标识
 * @returns {string[]} 当前类型及其子类型标识
 */
export function getTypeAndDescendantIds(types, typeId) {
    for (const type of types) {
        if (String(type.key) === String(typeId)) {
            return [String(type.key), ...getDescendantTypeIds(type.children || [])];
        }
        const matchedIds = getTypeAndDescendantIds(type.children || [], typeId);
        if (matchedIds.length > 0) {
            return matchedIds;
        }
    }
    return [];
}

/**
 * <p>查找指定类型的父类型标识。</p>
 *
 * @param {Array} types 类型树
 * @param {string | number} typeId 目标类型标识
 * @param {string | number | null} parentId 父类型标识
 * @returns {string | number | null} 父类型标识
 */
export function getParentTypeId(types, typeId, parentId = null) {
    for (const type of types) {
        if (String(type.key) === String(typeId)) {
            return parentId;
        }
        const matchedParentId = getParentTypeId(type.children || [], typeId, type.key);
        if (matchedParentId !== null) {
            return matchedParentId;
        }
    }
    return null;
}

/**
 * <p>比较两个项目指定字段的值。</p>
 *
 * @param {Object} first 第一个项目
 * @param {Object} second 第二个项目
 * @param {string} field 排序字段
 * @returns {number} 比较结果
 */
export function compareProjectField(first, second, field) {
    if (field === "startDate") {
        return (first.startDate || "").localeCompare(second.startDate || "");
    }
    return Number(first[field] || 0) - Number(second[field] || 0);
}

/**
 * <p>根据筛选和排序条件返回项目列表。</p>
 *
 * @param {Array} projects 项目列表
 * @param {string[] | null} selectedTypeIds 已选类型标识
 * @param {Object} searchConditions 搜索条件
 * @param {Object} projectSorter 排序条件
 * @returns {Array} 用于表格展示的项目列表
 */
export function filterProjects(projects, selectedTypeIds, searchConditions, projectSorter) {
    return projects
        .filter((project) => !selectedTypeIds || selectedTypeIds.includes(String(project.typeId)))
        .filter((project) => {
            const {name, startDate, endDate, important, state} = searchConditions;
            if (name && !project.name.toLowerCase().includes(name.trim().toLowerCase())) {
                return false;
            }
            if ((startDate || endDate) && (!project.startDate
                || (startDate && project.startDate < startDate.format("YYYY-MM-DD"))
                || (endDate && project.startDate > endDate.format("YYYY-MM-DD")))) {
                return false;
            }
            return (important === undefined || project.important === important)
                && (state === undefined || project.state === state);
        })
        .sort((first, second) => {
            if (projectSorter.field && projectSorter.order) {
                const compareResult = compareProjectField(first, second, projectSorter.field);
                return projectSorter.order === "ascend" ? compareResult : -compareResult;
            }
            const stateDifference = (PROJECT_STATE_ORDER[first.state] ?? Number.MAX_SAFE_INTEGER)
                - (PROJECT_STATE_ORDER[second.state] ?? Number.MAX_SAFE_INTEGER);
            return stateDifference !== 0
                ? stateDifference
                : (second.startDate || "").localeCompare(first.startDate || "");
        })
        .map((project) => ({...project, key: project.id}));
}
