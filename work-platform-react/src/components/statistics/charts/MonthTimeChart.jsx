import React, {useState} from "react";
import useChartApiData from "./useChartApiData";
import useBarChartOption from "./useBarChartOption";
import MonthTimeChartCondition from "./MonthTimeChartCondition";
import {ChartApi} from "../../../request/chartApi";
import useChartData from "./useChartData";
import ReactECharts from "echarts-for-react";
import useDefaultMaxValue from "./useDedefaultMaxValue";

const MonthTimeChart = () => {
    const [condition, setCondition] = useState({dateRangeType:4});
    const apiData = useChartApiData(condition,ChartApi.monthTimeCount);
    const {seriesData, xName,categories} = useChartData(apiData);
    const defaultMaxValue = useDefaultMaxValue(apiData, 70);
    const option = useBarChartOption(seriesData,categories,xName,defaultMaxValue,'小时');

    const handleConditionChange = (condition) => {
        setCondition(condition);
    }

    return (
        <div>
            <MonthTimeChartCondition onChange={handleConditionChange} monthItems={[4,5,3]} />
            <div style={{height: 300, paddingTop: 10}}>
                <ReactECharts option={option} notMerge/>
            </div>
        </div>
    )
}

export default MonthTimeChart;
