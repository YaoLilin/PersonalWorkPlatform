import {Col, Form, Select} from "antd";
import MarkTag from "./MarkTag";
import React from "react";

const MarkSelector = ({editAble,value})=>{
    return(
        <Col span={12}>
            <Form.Item
                label="评价"
                name="mark"
                labelAlign={'left'}
                rules={[{required: editAble}]}
            >
                {
                    editAble ? <Select
                            options={[
                                {
                                    value: 1,
                                    label: '不合格',
                                },
                                {
                                    value: 2,
                                    label: '合格',
                                },
                                {
                                    value: 3,
                                    label: '优秀',
                                },
                            ]}
                        />
                        : <MarkTag mark={value}/>
                }
            </Form.Item>
        </Col>
    )
}

export default MarkSelector;