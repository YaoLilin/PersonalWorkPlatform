/**
 * 沿类型树向下传递最近的已配置颜色。<br>
 * <p>每层先使用自身颜色，否则沿用最近祖先的颜色；递归到叶节点结束。</p>
 * <p>仅用于显示，未配置颜色的类型仍保留原始空值。</p>
 *
 * @param {Array} types 类型树
 * @returns {Object} 类型编号到继承后颜色的映射
 */
export function getInheritedTypeColors(types) {
    const colors = {};
    const visit = (nodes, parentColor) => nodes.forEach((node) => {
        const color = node.color || parentColor;
        if (color) colors[node.key] = color;
        visit(node.children || [], color);
    });
    visit(types, null);
    return colors;
}
