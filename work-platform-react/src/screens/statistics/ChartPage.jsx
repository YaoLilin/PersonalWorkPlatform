import {Flex} from "antd";
import WeekTimeChart from "../../components/statistics/charts/WeekTimeChart";
import MonthTimeChart from "../../components/statistics/charts/MonthTimeChart";
import WorkTimePieChart from "../../components/statistics/charts/WorkTimePieChart";
import ChartFullscreenCard from "../../components/statistics/charts/ChartFullscreenCard";
import "./chart-page.css";

/**
 * 统计图页面。
 *
 * @returns {JSX.Element} 周、月和占比统计图卡片。
 */
const ChartPage = () => {
    return (
        <Flex className="chart-page" wrap gap={30}>
            <ChartFullscreenCard
                title="每周利用时间统计"
            >
                <WeekTimeChart/>
            </ChartFullscreenCard>
            <ChartFullscreenCard
                title="每月利用时间统计"
            >
                <MonthTimeChart/>
            </ChartFullscreenCard>
            <ChartFullscreenCard
                title="利用时间占比"
            >
                <WorkTimePieChart/>
            </ChartFullscreenCard>
        </Flex>
    );
};

export default ChartPage;
