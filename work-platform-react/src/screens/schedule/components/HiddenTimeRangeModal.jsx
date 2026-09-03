import React from "react";
import {Modal, TimePicker} from "antd";

/**
 * <p>编辑日历隐藏时间段的弹窗。</p>
 *
 * @param {Object} props 组件参数
 * @param {boolean} props.open 是否显示弹窗
 * @param {Array | null} props.value 当前编辑的时间范围
 * @param {Function} props.onChange 更新时间范围的回调
 * @param {Function} props.onSave 保存时间范围的回调
 * @param {Function} props.onClose 关闭弹窗的回调
 * @returns {JSX.Element} 隐藏时间段弹窗
 */
const HiddenTimeRangeModal = ({open, value, onChange, onSave, onClose}) => (
    <Modal
        title="隐藏时间段"
        open={open}
        onOk={onSave}
        onCancel={onClose}
        okText="确定"
        cancelText="取消"
    >
        <TimePicker.RangePicker
            value={value}
            format="HH:mm"
            minuteStep={30}
            placeholder={["开始时间", "结束时间"]}
            onChange={onChange}
        />
    </Modal>
);

export default HiddenTimeRangeModal;
