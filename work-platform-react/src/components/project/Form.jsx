import React, {useState} from "react";
import {Button, Checkbox, Col, DatePicker, Form, Input, InputNumber, Row, Select} from "antd";
import {useNavigate} from "react-router-dom";
import {ArrowLeftOutlined} from "@ant-design/icons";
import './project.css';
import TypeSelector from "../public/TypeSelector";
import PropTypes from "prop-types";
import dayjs from "dayjs"

const TYPE_CREATE = "create";
const TYPE_EDIT = "edit";
const ProjectForm =  ({data,onSubmit,type=TYPE_CREATE}) => {
    const navigate = useNavigate();
    const [treeValue, setTreeValue] = useState();
    const [endDateDisabled,setEndDateDisabled] = useState(data?.isStartDateOnly ===1);
    const format = 'YYYY-MM-DD';

    const onFinish = (values) => {
        const params = {
            id:data.id,
            name: values.name,
            progress: values.progress ? Number(values.progress) : 0,
            important: values.important ,
            state: values.state,
            type: values.type,
            startDate: values.startDate.format('YYYY-MM-DD'),
            endDate: values.endDate?.format('YYYY-MM-DD'),
            closeDate:values.closeDate?.format('YYYY-MM-DD'),
            isStartDateOnly:endDateDisabled ? 1 : 0,
        }
        onSubmit(params);
    };

    const getInitDate= (date)=>{
        return date ? {initialValue: date} : null;
    }

    const onTreeChange =(newValue)=>{
        setTreeValue(newValue);
    }

    return (
        <>

            <div>
                <ArrowLeftOutlined style={{
                    margin: '10px 20px', fontSize: '2em', color: 'grey', cursor: 'pointer'
                    , display: 'inline-block'
                }} onClick={() => {
                    navigate('/projects')
                }}/>
            </div>

            <div className={'form-card'}>
                <Form
                    name="basic"
                    labelCol={{
                        span: 4,
                    }}
                    wrapperCol={{
                        span: 8,
                    }}
                    style={{maxWidth: '800px', margin: '0 auto'}}
                    autoComplete="off"
                    onFinish={onFinish}
                    method={'post'}
                >
                    <Row gutter={0} justify="start">
                        <Col span={24}>
                            <Form.Item
                                label="名称"
                                name="name"
                                labelAlign={'left'}
                                initialValue={data.name}
                                rules={[{required: true}]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item
                                label="类型"
                                name="type"
                                labelAlign={'left'}
                                rules={[{required: true}]}
                                initialValue={data.typeId}
                            >
                                <TypeSelector allowClear={true} value={treeValue} onChange={onTreeChange}/>
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item
                                label="不限定日期区间"
                                name="isStartDateOnly"
                                labelAlign={'left'}
                            >
                                <Checkbox checked={endDateDisabled} onChange={(e)=>{setEndDateDisabled(e.target.checked)}}/>
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item
                                label="开始日期"
                                name="startDate"
                                labelAlign={'left'}
                                rules={[{required: true}]}
                                {...getInitDate(data.startDate ? dayjs(data.startDate,format) : null)}
                            >
                                <DatePicker />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item
                                label="结束日期"
                                name="endDate"
                                labelAlign={'left'}
                                rules={[{required: !endDateDisabled}]}
                                {...getInitDate(data.endDate ? dayjs(data.endDate,format) : null)}
                            >
                                <DatePicker disabled={endDateDisabled}/>
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item
                                label="关闭日期"
                                name="closeDate"
                                labelAlign={'left'}
                                {...getInitDate(data.closeDate ? dayjs(data.closeDate,format) : null)}
                            >
                                <DatePicker />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item
                                label="进度"
                                name="progress"
                                labelAlign={'left'}
                                initialValue={data.progress}
                            >
                                <InputNumber max={100} min={0}/>
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item
                                label="状态"
                                name="state"
                                labelAlign={'left'}
                                rules={[{required: true}]}
                                initialValue={data.state}
                            >
                                <Select
                                    style={{width: 120}}
                                    options={[
                                        {value: 0, label: '待开始'},
                                        {value: 1, label: '进行中'},
                                        {value: 2, label: '已完成'},
                                    ]}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item
                                label="是否重要"
                                name="important"
                                labelAlign={'left'}
                                rules={[{required: true}]}
                                initialValue={data.important}
                            >
                                <Select
                                    style={{width: 120}}
                                    options={[
                                        {value: 0, label: '不重要'},
                                        {value: 1, label: '重要'},
                                    ]}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item
                                wrapperCol={{
                                    offset: 8,
                                    span: 16,
                                }}
                            >
                                <Button type="primary" htmlType="submit">
                                    {type === 'create' ? '提交':'保存'}
                                </Button>
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </div>
        </>
    )
}

ProjectForm.prototype={
    type:PropTypes.string.isRequired,
    data:PropTypes.object.isRequired,
    onSubmit:PropTypes.func.isRequired,
    onCancel:PropTypes.func.isRequired,
}

export default ProjectForm;