import {Tooltip} from "antd";
import ReactECharts from "echarts-for-react";
import {formatHours, getProjectTimeTotalLabel, truncateToTwoDigits} from "../utils/scheduleUtils";

/**
 * 项目时间统计图。
 *
 * @param {{data: Array, chartType: string, expanded?: boolean}} props 图表参数
 * @param {Array} props.data 项目时间统计数据
 * @param {string} props.chartType 图表类型，支持 pie 或 bar
 * @param {boolean} [props.expanded=false] 是否使用放大图表布局
 * @returns {JSX.Element} 图表
 */
const ProjectTimeChart = ({data, chartType, expanded = false}) => {
    const sortedData = [...data].sort((first, second) => second.value - first.value);
    const total = sortedData.reduce((sum, item) => sum + item.value, 0);
    const formatter = (params) => `<div style="font-size: 12px;display: flex;align-items: center">${params.marker}<span style="padding: 0 10px;display: inline-block;max-width: 180px;word-break: break-all">${params.name}</span><span>${formatHours(params.value)} 小时 ${(total ? truncateToTwoDigits(params.value / total * 100) : 0).toFixed(2)}%</span></div>`;
    const option = chartType === "bar" ? {
        tooltip: {trigger: "item", appendToBody: true, className: "schedule-project-time-tooltip", formatter},
        grid: {top: 8, right: expanded ? 96 : 52, bottom: 4, left: expanded ? 130 : 10, containLabel: expanded},
        xAxis: {type: "value", axisLine: {show: false}, axisTick: {show: false}, axisLabel: {show: false}},
        yAxis: {
            type: "category",
            data: sortedData.map((item) => item.name),
            inverse: true,
            axisLine: {show: false},
            axisTick: {show: false},
            splitLine: {show: false},
            axisLabel: {
                show: expanded,
                formatter: (name) => name.length > (expanded ? 16 : 9) ? `${name.slice(0, expanded ? 16 : 9)}…` : name,
            },
        },
        series: [{
            name: "项目时间统计",
            type: "bar",
            data: sortedData,
            barMaxWidth: 30,
            barCategoryGap: "35%",
            itemStyle: {borderRadius: [0, 4, 4, 0]},
            label: {
                show: true,
                position: "right",
                color: "#595959",
                formatter: (params) => `${formatHours(params.value)} 小时`
            },
        }],
    } : {
        tooltip: {trigger: "item", appendToBody: true, className: "schedule-project-time-tooltip", formatter},
        series: [{
            name: "项目时间统计",
            type: "pie",
            radius: expanded ? ["38%", "63%"] : ["42%", "64%"],
            center: ["50%", "50%"],
            data: sortedData,
            padAngle: 2,
            itemStyle: {borderColor: "#fff", borderWidth: 3, borderRadius: 8},
            label: expanded ? {
                show: true,
                formatter: (params) => `${params.name}\n${params.percent}%`,
                overflow: "truncate",
                width: 110
            } : {show: false},
            labelLine: {show: expanded},
            emphasis: {itemStyle: {shadowBlur: 10, shadowOffsetX: 0, shadowColor: "rgba(0, 0, 0, 0.5)"}},
        }],
    };

    const resizeAfterContainerVisible = (chart) => {
        requestAnimationFrame(() => requestAnimationFrame(() => chart.resize()));
    };

    return (
        <ReactECharts
            className={expanded ? "schedule-project-time-chart-expanded" : "schedule-project-time-chart"}
            option={option}
            notMerge
            onChartReady={resizeAfterContainerVisible}
        />
    );
};

/**
 * 项目时间统计内容。
 *
 * @param {{data: Array, totalHours: number, chartType: string, viewType: string, expanded?: boolean}} props 统计参数
 * @param {Array} props.data 项目时间统计数据
 * @param {number} props.totalHours 项目累计时长
 * @param {string} props.chartType 图表类型，支持 pie 或 bar
 * @param {string} props.viewType 当前日历视图类型
 * @param {boolean} [props.expanded=false] 是否使用放大布局
 * @returns {JSX.Element} 内容
 */
export const ProjectTimeStatisticsContent = ({
    data,
    totalHours,
    chartType,
    viewType,
    expanded = false,
}) => (
    <>
        <div className="schedule-project-time-total">
            {getProjectTimeTotalLabel(viewType)}：{formatHours(totalHours)} 小时
        </div>
        {!expanded && (
            <div className="schedule-project-time-legend">
                {[...data].sort((first, second) => second.value - first.value).map((item) => (
                    <div className="schedule-project-time-legend-item" key={item.name}>
                        <span className="schedule-project-time-legend-color"
                              style={{backgroundColor: item.itemStyle.color}}/>
                        <Tooltip title={item.name}>
                            <span className="schedule-project-time-legend-name">{item.name}</span>
                        </Tooltip>
                        <span>{formatHours(item.value)} 小时</span>
                    </div>
                ))}
            </div>
        )}
        <ProjectTimeChart data={data} chartType={chartType} expanded={expanded}/>
    </>
);
