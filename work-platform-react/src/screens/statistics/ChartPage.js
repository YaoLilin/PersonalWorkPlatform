import {Card,Flex} from "antd";
import WeekTimeChart from "../../components/statistics/charts/WeekTimeChart";
import MonthTimeChart from "../../components/statistics/charts/MonthTimeChart";
import ChartDebug from "../../components/statistics/charts/ChartDebug";

const ChartPage = () => {

    return (
        <Flex wrap gap={30}>
            <Card style={{width:500}} title={'每周利用时间统计'}>
                <WeekTimeChart />
            </Card>
            <Card style={{width:500}} title={'每月利用时间统计'}>
                <MonthTimeChart />
            </Card>
            <Card style={{width:500}} title={'利用时间占比'}>

            </Card>
        </Flex>

    )
}

export default ChartPage;