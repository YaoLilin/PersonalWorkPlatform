import {Col, DatePicker, Form} from "antd";
import dayjs from "dayjs";
import React from "react";
import DateUtil from "../../../util/DateUtil";

/**
 * 周次展示；仅创建周记录时允许选择日期。
 * @param {{isFormCreate: boolean, onWeekChange: Function, value?: string}} props 创建状态、日期变更事件和当前周日期。
 */
const WeekSelector = ({isFormCreate,onWeekChange,value}) => {
    const getWeekRange = () => {
        const {startDate, endDate} = DateUtil.getWeekRangeByDate(value);
        return startDate + ' ' + endDate;
    }
    return (
        <Col span={12}>
            {
                    isFormCreate ?
                    <Form.Item
                        label="选择周次"
                        name="week"
                        labelAlign={'left'}
                        rules={[{required: true}]}
                    >
                        <DatePicker picker="week" onChange={onWeekChange}/>
                    </Form.Item>
                    :
                    <>
                        <span style={{fontSize: '2em'}}>{dayjs(value).week()}周</span>
                        <span style={{paddingLeft: '10px'}}>{getWeekRange()}</span>
                    </>
            }
        </Col>
    )
}

export default WeekSelector;
