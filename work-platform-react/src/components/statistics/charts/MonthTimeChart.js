import WeekTimeChartConditions from "./WeekTimeChartConditions";
import {useState} from "react";
import useChartData from "./useChartData";
import {Column} from "@ant-design/charts";
import useBarChartConfig from "./useBarChartConfig";
import MonthTimeChartCondition from "./MonthTimeChartCondition";
import {ChartApi} from "../../../request/chartApi";

const MonthTimeChart = () => {
    const [condition, setCondition] = useState({dateRangeType:4});
    const data = useChartData(condition,ChartApi.monthTimeCount);
    const config = useBarChartConfig(data)

    const handleConditionChange = (condition) => {
        setCondition(condition);
    }

    return (
        <div>
            <MonthTimeChartCondition onChange={handleConditionChange}/>
            <div style={{height: 300}}>
                <Column {...config} />
            </div>
        </div>
    )
}

export default MonthTimeChart;