/**
 * <p>按清单类型分组可见清单。</p>
 */
export function getChecklistGroups(checklists, typeTree, selectedTypeIds) {
    const groups = new Map();
    checklists.filter((item) => !selectedTypeIds || selectedTypeIds.includes(String(item.checklistTypeId)))
        .forEach((item) => {
            const group = groups.get(item.checklistTypeId) || {
                id: item.checklistTypeId, name: item.checklistTypeName,
                color: item.checklistTypeId ? findTypeColor(typeTree, item.checklistTypeId) : "#1677FF", items: [],
            };
            group.items.push(item);
            groups.set(item.checklistTypeId, group);
        });
    return [...groups.values()];
}

/** <p>查找类型颜色。</p> */
function findTypeColor(types, typeId) {
    for (const type of types) {
        if (Number(type.key) === Number(typeId)) return type.color;
        const color = findTypeColor(type.children || [], typeId);
        if (color) return color;
    }
    return undefined;
}

/** <p>将类型树转换为下拉选项。</p> */
export function flattenTypes(types, prefix = "") {
    return types.flatMap((type) => [{value: type.key, label: `${prefix}${type.title}`},
        ...flattenTypes(type.children || [], `${prefix}— `)]);
}
