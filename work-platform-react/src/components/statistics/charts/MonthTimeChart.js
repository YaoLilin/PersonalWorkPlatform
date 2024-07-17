import WeekTimeChartConditions from "./WeekTimeChartConditions";
import {useState} from "react";
import useWeekTimeChartData from "./useWeekTimeChartData";
import {Column} from "@ant-design/charts";
import useBarChartConfig from "./useBarChartConfig";

const MonthTimeChart = () => {
    const [condition, setCondition] = useState({});
    const data = useWeekTimeChartData(condition);
    const config = useBarChartConfig(data)

    const handleConditionChange = (condition) => {
        setCondition(condition);
    }

    return (
        <div>
            <WeekTimeChartConditions onChange={handleConditionChange}/>
            <div style={{height: 300}}>
                <Column {...config} />
            </div>
        </div>
    )
}

export default MonthTimeChart;