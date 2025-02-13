import ReactECharts from "echarts-for-react";
import MonthTimeChartCondition from "./MonthTimeChartCondition";
import React, {useState} from "react";
import useChartApiData from "./useChartApiData";
import {ChartApi} from "../../../request/chartApi";

const WorkTimePieChart = ({showCondition=true ,defaultCondition= {dateRangeType:4},
                          showLegend=true}) => {
    const [condition, setCondition] = useState(defaultCondition);
    const apiData = useChartApiData(condition,ChartApi.workTimeProportion);
    const chartData = apiData.map(i =>({
        name:i.name,
        value:i.count
    }));

    const option = {
        tooltip: {
            trigger: 'item',
            formatter: (params) => {
                debugger
                // 不显示系列的值为0的数据
                let html = '';
                html+='<div style="font-size: 12px;display: flex;align-items: center">';
                html+= params.marker;
                html+= `<div style="padding: 0 10px 0 10px;display: inline-block;width: 120px;white-space: nowrap;
                            text-overflow:ellipsis;overflow: hidden">
                                ${params.name} 
                            </div>
                            <span>${params.percent}% ${params.value} 小时 </span>`;
                html+='</div>'
                return html ? `<div>${html}</div>` : null;
            }
        },
        legend: showLegend ? {
            orient: 'horizontal',
            left: 'center',
            type: 'scroll',
            top:'0%'
        } : null,
        series: [
            {
                name: '工作时间统计',
                type: 'pie',
                radius: '60%',
                center: ['50%', showLegend ? '60%' : '50%'],
                data: chartData,
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
                showCondition && <MonthTimeChartCondition onChange={handleConditionChange} defaultMonth={8}/>
            }
            <div style={{paddingTop:10}}>
                <ReactECharts option={option} notMerge/>
            </div>
        </div>
    )
}

export default WorkTimePieChart;
