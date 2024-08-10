import {Col, Row} from "antd";
import FormTitle from "../../ui/FormTitle";
import React from "react";

const FullRow = ({children,style}) => {
    return (
        <Row style={{...style}}>
            <Col span={24}>
                {children}
            </Col>
        </Row>
    )
}

export default FullRow;