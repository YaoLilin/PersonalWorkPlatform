
import {chartChecklistRichText, chartChecklistTooltipTag} from "./chartChecklistBadge";

const useBarChartOption = (data =[], categories=[],xName=[],defaultMaxValue = 1000, unit = '分钟') => {
    const seriesByKey = new Map(data.map(item => [item.name, item]));
    const escapeHtml = (value) => String(value).replace(/[&<>"']/g, character => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[character]);
    // ECharts 配置
    return {
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            },
            formatter :(params)=>{
                // 不显示系列的值为0的数据
                let html = '';
                // params数组每个元素表示一个系列
                params.forEach(item =>{
                    if (item.seriesName === '全部' || item.value === 0) {
                        return;
                    }
                    const series = seriesByKey.get(item.seriesName);
                    const checklistTag = series?.isChecklist
                        ? chartChecklistTooltipTag
                        : '';
                    html+='<div style="font-size: 12px;display: flex;align-items: center">';
                    html+= item.marker;
                    html+= `<div style="padding:0 10px;display:inline-flex;align-items:center;gap:6px;max-width:180px">
                                <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escapeHtml(series?.displayName || item.seriesName)}</span>${checklistTag}
                            </div>
                            <span> ${item.value} ${unit} </span>`;
                    html+='</div>'
                });
                return html ? `<div>${html}</div>` : null;
            }
        },
        legend: {
            data: categories,
            type: 'scroll',
            formatter: (key) => {
                const series = seriesByKey.get(key);
                const name = series?.displayName || key;
                return series?.isChecklist ? `{name|${name}} {badge|清单}` : name;
            },
            textStyle: {
                rich: chartChecklistRichText
            }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: [
            {
                type: 'category',
                data: xName,
                axisTick: {
                    alignWithLabel: true,
                },
                axisLine: { // 隐藏轴线
                    show: false
                },
                axisLabel: {
                    rotate: xName.length > 5 ? 45 :0
                }
            },
        ],
        yAxis:{
            max:defaultMaxValue,
            scale: true,
        },
        series: data
    };
}

export default useBarChartOption;
