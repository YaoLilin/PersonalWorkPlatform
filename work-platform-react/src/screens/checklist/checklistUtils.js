import {getInheritedTypeColors} from "../../util/typeColorUtils";

/**
 * <p>按清单类型分组可见清单。</p>
 *
 * @param {Array} checklists 清单列表
 * @param {Array} typeTree 清单类型树
 * @param {string[] | null} selectedTypeIds 可见类型编号
 * @returns {Array} 清单分组
 */
export function getChecklistGroups(checklists, typeTree, selectedTypeIds) {
    const groups = new Map();
    const typeColors = getInheritedTypeColors(typeTree);
    if (!selectedTypeIds) {
        groups.set(null, {id: null, name: "收集箱", color: "#1677FF", items: []});
    }
    // 即使只显示部分分组，仍遍历完整层级，以便找到深层类型；叶节点结束递归。
    const addTypes = (types) => types.forEach((type) => {
        if (!selectedTypeIds || selectedTypeIds.includes(String(type.key))) {
            groups.set(type.key, {id: type.key, name: type.title, color: typeColors[type.key] || "#1677FF", items: []});
        }
        addTypes(type.children || []);
    });
    addTypes(typeTree);
    checklists.filter((item) => !selectedTypeIds || selectedTypeIds.includes(String(item.checklistTypeId)))
        .forEach((item) => {
            const group = groups.get(item.checklistTypeId) || {
                id: item.checklistTypeId, name: item.checklistTypeName,
                color: typeColors[item.checklistTypeId] || "#1677FF", items: [],
            };
            group.items.push(item);
            groups.set(item.checklistTypeId, group);
        });
    return [...groups.values()];
}

/** <p>将类型树转换为下拉选项。</p> */
export function flattenTypes(types, prefix = "") {
    return types.flatMap((type) => [{value: type.key, label: `${prefix}${type.title}`},
        ...flattenTypes(type.children || [], `${prefix}— `)]);
}
