import {Col, Form} from "antd";
import TextArea from "antd/es/input/TextArea";
import React from "react";
import PropTypes from "prop-types";

const SummaryTextArea = ({editAble=false, value}) => {
    return (
        <Col span={24}>
            {
                editAble ?
                    <Form.Item
                        label=""
                        name="summary"
                        labelAlign={'left'}
                        rules={[{
                            required: true,
                            message: '请输入总结',
                        }]}
                        labelCol={{
                            span: 0,
                        }}
                        wrapperCol={{
                            span: 24,
                        }}
                    >
                        <TextArea rows={4}/>
                    </Form.Item>
                    : <div style={{
                        padding: 6,
                        border: 'solid 1px #eee',
                        borderRadius: '6px',
                        width: 800
                    }}>{value}</div>
            }
        </Col>
    )
}

SummaryTextArea.prototype={
    editAble:PropTypes.bool,
    value:PropTypes.string.isRequired
}
export default SummaryTextArea;