import {Col, DatePicker, Form} from "antd";
import dayjs from "dayjs";
import React from "react";
import DateUtil from "../../../util/DateUtil";

const WeekSelector = ({editAble,isFormCreate,onWeekChange,value}) => {
    const getWeekRange = () => {
        const {startDate, endDate} = DateUtil.getWeekRangeByDate(value);
        return startDate + ' ' + endDate;
    }
    return (
        <Col span={12}>
            {
                    editAble ?
                    <Form.Item
                        label="选择周次"
                        name="week"
                        labelAlign={'left'}
                        rules={[{required: true}]}
                    >
                        <DatePicker disabled={!isFormCreate} picker="week" onChange={onWeekChange}/>
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