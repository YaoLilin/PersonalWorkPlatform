import React, {useState} from 'react';
import './index.css';
import WeekTimeChartConditions from "./WeekTimeChartConditions";
import {Column} from "@ant-design/charts";
import useChartData from "./useChartData";
import useBarChartConfig from "./useBarChartConfig";
import {ChartApi} from "../../../request/chartApi";

const WeekTimeChart = () => {
    const [condition, setCondition] = useState({});
    const data = useChartData(condition,ChartApi.weekTimeCount);
    const config = useBarChartConfig(data);

    const handleConditionChange = (condition)=>{
        setCondition(condition);
    }


    return (
        <div>
            <WeekTimeChartConditions onChange={handleConditionChange}/>
            <div  style={{height:300}} >
              <Column {...config} />
            </div>
        </div>
    );
};

export default WeekTimeChart;