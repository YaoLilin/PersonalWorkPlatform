import {useContext, useEffect, useState} from "react";
import {MessageContext} from "../../../provider/MessageProvider";
import {ChartApi} from "../../../request/chartApi";


const useWeekTimeChartData = (condition) => {
    const [data, setData] = useState([]);
    const messageApi = useContext(MessageContext);
    useEffect(() => {
        const {selectedDateRange = 0, customStartDate = null,customEndDate = null,selectedCountType = 0,
            selectedProjects = [], selectedTypes = []} = condition;
        const params = {
            timeRange : selectedDateRange,
            countType : selectedCountType,
            startDate : customStartDate,
            endDate : customEndDate,
            projects:selectedProjects.join(','),
            types:selectedTypes.join(',')
        }
        ChartApi.weekTimeCount(params).then( result =>{
            setData(result);
        }).catch(() =>{
            messageApi.error('获取统计数据失败', 5);
        });
    }, [condition,messageApi]);
    return data;
}

export default useWeekTimeChartData;