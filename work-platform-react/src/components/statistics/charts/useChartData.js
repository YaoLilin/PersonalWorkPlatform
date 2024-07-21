import {useContext, useEffect, useState} from "react";
import {MessageContext} from "../../../provider/MessageProvider";
import {ChartApi} from "../../../request/chartApi";


const useChartData = (condition,apiFunc = ()=>{}) => {
    const [data, setData] = useState([]);
    const messageApi = useContext(MessageContext);
    useEffect(() => {
        const {dateRangeType = 0, startDate = null,endDate = null,countType = 0,
            projects = [], types = []} = condition;
        const params = {
            timeRange : dateRangeType,
            countType : countType,
            startDate : startDate,
            endDate : endDate,
            projects:projects.join(','),
            types:types.join(',')
        }
        apiFunc(params).then( result =>{
            setData(result);
        }).catch(() =>{
            messageApi.error('获取统计数据失败', 5);
        });
    }, [condition,messageApi,apiFunc]);
    return data;
}

export default useChartData;