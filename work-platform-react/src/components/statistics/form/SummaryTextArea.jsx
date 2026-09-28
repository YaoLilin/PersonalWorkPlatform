import {Col, Form} from "antd";
import TextArea from "antd/es/input/TextArea";
import React from "react";
import PropTypes from "prop-types";

/**
 * 总结编辑框或只读内容。
 * @param {{editAble?: boolean, value?: string}} props 编辑状态与总结内容。
 */
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
                    : <div className="statistics-summary-readonly" style={{
                        padding: 6,
                        border: '1px solid #e6e6e6',
                        borderRadius: 8,
                        boxSizing: 'border-box',
                        width: 'min(800px, 100%)'
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
