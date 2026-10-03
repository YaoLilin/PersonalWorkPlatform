import ReactECharts from "echarts-for-react";

/**
 * 项目与独立清单的用时占比图。
 * @param {{data: Array<{name: string, minutes: number, isChecklist: boolean}>}} props 任务统计数据。
 */
const WeekTaskPieChart = ({data}) => {
    const option = {
        tooltip: {
            trigger: 'item',
            formatter: ({data: item, percent}) => `${item.name}${item.isChecklist ? ' [清单]' : ''}<br/>${percent}% · ${(item.value / 60).toFixed(2)} 小时`,
        },
        series: [{
            type: 'pie',
            radius: '60%',
            data: data.map(item => ({name: item.name, value: item.minutes, isChecklist: item.isChecklist})),
            label: {
                formatter: ({data: item, percent}) => item.isChecklist
                    ? `{name|${item.name}} {badge|清单} {percent|${percent}%}`
                    : `{name|${item.name}} {percent|${percent}%}`,
                rich: {
                    name: {color: '#1d1d1f'},
                    badge: {color: '#1677ff', borderColor: '#e6e6e6', borderWidth: 1, borderRadius: 8, padding: [2, 4], fontSize: 10},
                    percent: {color: '#6e6e73'},
                },
            },
        }],
    };
    return <ReactECharts option={option} style={{height: 300}}/>;
};

export default WeekTaskPieChart;
