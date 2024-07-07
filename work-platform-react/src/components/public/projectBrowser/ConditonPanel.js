import {Col, Input, Row} from "antd";
import Search from "antd/es/input/Search";
import TypeSelector from "../TypeSelector";
import React, {useState} from "react";
import PropTypes from "prop-types";

const ConditionPanel = ({onSearch, onChange}) => {
    const [name, setName] = useState('');
    const [type, setType] = useState(null);

    return <Row>
        <Col span={12}>
            <span style={{paddingRight: 20}}>名称</span>
            <Input style={{width: 200}} onChange={(e=>{
                setName(e.target.value);
                onChange(e.target.value, type);
            })}/>
        </Col>
        <Col span={12}>
            <span style={{paddingRight: 20}}>类型</span>
            <TypeSelector allowClear={true}
                          onChange={(v) => {
                              setType(v);
                              onChange(name, v);
                          }}
                          style={{width: "200px"}}/>
        </Col>
    </Row>;
}
ConditionPanel.prototype={
    onSearch:PropTypes.func,
    onChange:PropTypes.func,
}

export default ConditionPanel;