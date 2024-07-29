import {useContext, useEffect, useMemo, useState} from "react";
import {MessageContext} from "../../../provider/MessageProvider";


const useChartApiData = (condition, apiFunc = () => {
}) => {
    const [apiData, setApiData] = useState([]);
    const messageApi = useContext(MessageContext);
    useEffect(() => {
        const {
            dateRangeType = 0, startDate = null, endDate = null, countType = 0,
            projects = [], types = []
        } = condition;
        const params = {
            timeRange: dateRangeType,
            countType: countType,
            startDate: startDate,
            endDate: endDate,
            projects: projects.join(','),
            types: types.join(',')
        }
        apiFunc(params).then(result => {
            setApiData(result);
        }).catch(() => {
            messageApi.error('获取统计数据失败', 5);
        });
    }, [apiFunc, condition, messageApi]);
    return apiData;
}

export default useChartApiData;