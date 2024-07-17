import React, {useState} from 'react';
import './index.css';
import WeekTimeChartConditions from "./WeekTimeChartConditions";
import {Column} from "@ant-design/charts";
import useWeekTimeChartData from "./useWeekTimeChartData";
import useBarChartConfig from "./useBarChartConfig";

const WeekTimeChart = () => {
    const [condition, setCondition] = useState({});
    const data = useWeekTimeChartData(condition);
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