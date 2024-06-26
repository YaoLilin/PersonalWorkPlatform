import {Radio} from "antd";
import React, {useContext, useMemo, useState} from "react";
import PieChart from "./PieChart";
import {ChartApi} from "../../../request/chartApi";
import {MessageContext} from "../../../provider/MessageProvider";
import PropTypes from "prop-types";

/**
 * 项目或类型时间统计的饼图
 */
const TimeCountChart = ({projectTime, weekId, monthId}) => {
    // projectTime item : {projectName:text,minutes:number}
    // 如果传入 weekId 不为空，则统计的类型时间是周的，如果传入的 monthId 不为空，则统计的类型时间是月份的

    const projectChartData = useMemo(() => {
        return projectTime.map(i => {
            if (i.projectName && i.minutes !== undefined && i.minutes !== null) {
                return {item: i.projectName, count: i.minutes}
            }
            return null;
        });
    }, [projectTime]);
    const [typeChartData, setTypeChartData] = useState([]);
    const [chartType, setChartType] = useState('project');
    const messageApi = useContext(MessageContext);

    const fetchWeekTypeCountData = (weekId) => {
        try {
            return ChartApi.typeCountOfWeek(weekId, 1);
        } catch (e) {
            messageApi.error("获取本周项目类型统计数据失败", 5);
        }
        return [];
    }

    const fetchMonthTypeCountData = (monthId) => {
        try {
            return ChartApi.typeCountOfMonth(monthId, 1);
        } catch (e) {
            messageApi.error("获取本周项目类型统计数据失败", 5);
        }
        return [];
    }

    const fetchTypeChartData = async () =>{
        let data = [];
        if (weekId) {
            data = await fetchWeekTypeCountData(weekId);
        } else if (monthId) {
            data = await fetchMonthTypeCountData(monthId);
        }
        return data.map(i => {
            if (i.name && i.count !== undefined && i.percent !== undefined) {
                return {item: i.name, count: i.count, percent: i.percent};
            }
            return null;
        });
    }

    const handleChartRadioChange = async (v) => {
        if (v.target.value === 'type') {
            if (typeChartData.length === 0) {
                const data = await fetchTypeChartData();
                setTypeChartData(data);
            }
        }
        setChartType(v.target.value);
    }

    return (
        <div>
            <div>
                <Radio.Group value={chartType} style={{padding: '20px 0 0'}} onChange={handleChartRadioChange}>
                    <Radio.Button value="project">项目</Radio.Button>
                    <Radio.Button value="type">类型</Radio.Button>
                </Radio.Group>
            </div>
            <div style={{padding: '10px 0'}}>
                <PieChart style={{width: 600, height: 300}} data={chartType === 'project' ? projectChartData : typeChartData}/>
            </div>
        </div>
    )

}

TimeCountChart.defaultProps = {
    projectTime: [],
}

TimeCountChart.prototype={
    projectTime: PropTypes.array.isRequired,
    weekId: PropTypes.number,
    monthId: PropTypes.number,
}

export default TimeCountChart;