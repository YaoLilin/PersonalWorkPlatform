import {BarChartOutlined, ExpandOutlined, PieChartOutlined} from "@ant-design/icons";
import {Button, Card, Space, Tooltip} from "antd";
import {useMemo, useState} from "react";
import {getProjectTimeStatistics, getProjectTimeStatisticsTitle} from "../utils/scheduleUtils";
import {ProjectTimeStatisticsContent} from "./ScheduleStatisticsContent";
import ScheduleStatisticsModal from "./ScheduleStatisticsModal";

/**
 * 项目时间统计卡片。
 *
 * @param {{data: Array, totalHours: number, viewType: string, chartType: string, onChartTypeChange: Function, onExpand: Function}} props 卡片参数
 * @param {Array} props.data 项目时间统计数据
 * @param {number} props.totalHours 项目累计时长
 * @param {string} props.viewType 当前日历视图类型
 * @param {string} props.chartType 图表类型，支持 pie 或 bar
 * @param {Function} props.onChartTypeChange 切换统计图类型的回调
 * @param {Function} props.onExpand 打开统计图放大视图的回调
 * @returns {JSX.Element} 卡片
 */
export const ScheduleStatisticsCard = ({
    data,
    totalHours,
    viewType,
    chartType,
    onChartTypeChange,
    onExpand,
}) => (
    <Card className="schedule-project-time-card" size="small" title={getProjectTimeStatisticsTitle(viewType)}
          extra={<Space size={0}>
              <Tooltip title={chartType === "pie" ? "切换为柱状图" : "切换为饼图"}>
                  <Button type="text" size="small"
                          icon={chartType === "pie" ? <BarChartOutlined/> : <PieChartOutlined/>}
                          onClick={onChartTypeChange}/>
              </Tooltip>
              <Tooltip title="放大统计图">
                  <Button type="text" size="small" icon={<ExpandOutlined/>} onClick={onExpand}/>
              </Tooltip>
          </Space>}>
        <ProjectTimeStatisticsContent data={data} totalHours={totalHours} chartType={chartType} viewType={viewType}/>
    </Card>
);

/**
 * 日程统计区及放大弹窗。<br>
 * <p>自行管理图表类型和弹窗开关，统计范围由日历视图提供。</p>
 *
 * @param {Object} props 统计输入
 * @param {Array} props.events 当前日程事件
 * @param {Object} props.range 日历视图时间范围及视图类型
 * @returns {JSX.Element} 统计卡片和弹窗
 */
export const ScheduleStatistics = ({events, range}) => {
    const [chartType, setChartType] = useState("pie");
    const [isOpen, setIsOpen] = useState(false);
    const statistics = useMemo(() => getProjectTimeStatistics(events, range), [events, range]);
    const totalHours = statistics.reduce((sum, item) => sum + item.value, 0);
    const toggleChart = () => setChartType((current) => current === "pie" ? "bar" : "pie");

    return (
        <>
            <ScheduleStatisticsCard
                data={statistics}
                totalHours={totalHours}
                viewType={range.viewType}
                chartType={chartType}
                onChartTypeChange={toggleChart}
                onExpand={() => setIsOpen(true)}
            />
            <ScheduleStatisticsModal
                open={isOpen}
                data={statistics}
                totalHours={totalHours}
                viewType={range.viewType}
                chartType={chartType}
                onChartTypeChange={toggleChart}
                onClose={() => setIsOpen(false)}
            />
        </>
    );
};
