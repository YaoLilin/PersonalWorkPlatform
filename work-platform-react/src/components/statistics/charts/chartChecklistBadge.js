const badgeColor = '#1677ff';
const badgeBorderColor = '#e6e6e6';

/** 图例和图表标签共用的清单标识样式。 */
export const chartChecklistRichText = {
    name: {color: '#1d1d1f'},
    badge: {
        color: badgeColor,
        borderColor: badgeBorderColor,
        borderWidth: 1,
        borderRadius: 8,
        padding: [2, 4],
        fontSize: 10
    }
};

/** 悬浮提示中的清单标识，与图例保持相同的字体、边框和尺寸。 */
export const chartChecklistTooltipTag = `<span style="display:inline-flex;align-items:center;box-sizing:border-box;vertical-align:middle;color:${badgeColor};border:1px solid ${badgeBorderColor};border-radius:8px;padding:2px 4px;font-size:10px;line-height:12px;white-space:nowrap">清单</span>`;
