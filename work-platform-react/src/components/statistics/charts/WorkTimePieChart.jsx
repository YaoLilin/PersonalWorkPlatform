import ReactECharts from "echarts-for-react";
import MonthTimeChartCondition from "./MonthTimeChartCondition";
import React, {useState} from "react";
import useChartApiData from "./useChartApiData";
import {ChartApi} from "../../../request/chartApi";
import {chartChecklistRichText, chartChecklistTooltipTag} from "./chartChecklistBadge";

/**
 * 展示所选月份范围内的利用时间占比。
 *
 * @param {Object} props 图表配置
 * @param {boolean} props.showCondition 是否显示筛选条件
 * @param {Object} props.defaultCondition 首次查询使用的筛选条件
 * @param {boolean} props.showLegend 是否显示图例
 * @returns {JSX.Element} 时间占比图
 */
const WorkTimePieChart = ({showCondition=true ,defaultCondition= {dateRangeType:8},
                          showLegend=true}) => {
    const [condition, setCondition] = useState(defaultCondition);
    const apiData = useChartApiData(condition,ChartApi.workTimeProportion);
    const chartData = apiData.map(i =>({
        name: i.key || i.name,
        displayName: i.name,
        isChecklist: Boolean(i.isChecklist),
        value: i.count
    }));
    const chartDataByKey = new Map(chartData.map(item => [item.name, item]));
    const escapeHtml = (value) => String(value).replace(/[&<>"']/g, character => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[character]);

    const option = {
        tooltip: {
            trigger: 'item',
            formatter: (params) => {
                const item = params.data;
                const checklistTag = item.isChecklist
                    ? chartChecklistTooltipTag
                    : '';
                return `<div style="font-size:12px;display:flex;align-items:center;gap:6px">
                    ${params.marker}<span>${escapeHtml(item.displayName)}</span>${checklistTag}
                    <span>${params.percent}% ${params.value} 小时</span></div>`;
            }
        },
        legend: showLegend ? {
            orient: 'horizontal',
            left: 'center',
            type: 'scroll',
            top:'0%',
            formatter: (key) => {
                const item = chartDataByKey.get(key);
                return item?.isChecklist
                    ? `{name|${item.displayName}} {badge|清单}` : (item?.displayName || key);
            },
            textStyle: {
                rich: chartChecklistRichText
            }
        } : null,
        series: [
            {
                name: '工作时间统计',
                type: 'pie',
                radius: '60%',
                center: ['50%', showLegend ? '60%' : '50%'],
                data: chartData,
                label: {
                    formatter: ({data: item}) => item.isChecklist
                        ? `{name|${item.displayName}} {badge|清单}` : item.displayName,
                    rich: chartChecklistRichText
                },
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }
            }
        ],
    };

    const handleConditionChange = (condition) => {
        setCondition(condition);
    }

    return(
        <div>
            {
                showCondition && <MonthTimeChartCondition onChange={handleConditionChange}
                                                      defaultMonth={defaultCondition.dateRangeType}/>
            }
            <div className="chart-page__plot">
                <ReactECharts option={option} notMerge style={{height: "100%"}}/>
            </div>
        </div>
    )
}

export default WorkTimePieChart;
