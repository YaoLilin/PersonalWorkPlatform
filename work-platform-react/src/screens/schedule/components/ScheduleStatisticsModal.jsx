import {BarChartOutlined, PieChartOutlined} from "@ant-design/icons";
import {Button, Modal} from "antd";
import {getProjectTimeStatisticsTitle} from "../utils/scheduleUtils";
import {ProjectTimeStatisticsContent} from "./ScheduleStatisticsContent";

/**
 * 日程项目时间统计的放大弹窗。
 *
 * @param {Object} props 弹窗参数
 * @param {boolean} props.open 是否显示弹窗
 * @param {Array} props.data 项目时间统计数据
 * @param {number} props.totalHours 总时长
 * @param {string} props.viewType 当前日历视图类型
 * @param {string} props.chartType 当前图表类型
 * @param {Function} props.onChartTypeChange 切换图表类型
 * @param {Function} props.onClose 关闭弹窗
 * @returns {JSX.Element} 统计弹窗
 */
const ScheduleStatisticsModal = ({
    open,
    data,
    totalHours,
    viewType,
    chartType,
    onChartTypeChange,
    onClose,
}) => (
    <Modal
        className="schedule-project-time-modal"
        open={open}
        title={<div className="schedule-project-time-modal-title">
            <span>{getProjectTimeStatisticsTitle(viewType)}</span>
            <Button
                type="text"
                icon={chartType === "pie" ? <BarChartOutlined/> : <PieChartOutlined/>}
                onClick={onChartTypeChange}
            />
        </div>}
        footer={null}
        width={760}
        onCancel={onClose}
    >
        <ProjectTimeStatisticsContent
            data={data}
            totalHours={totalHours}
            chartType={chartType}
            viewType={viewType}
            expanded
        />
    </Modal>
);

export default ScheduleStatisticsModal;
