import React, {useEffect, useState} from "react";
import {Button, Checkbox, Col, ColorPicker, DatePicker, Form, Input, InputNumber, Row, Select} from "antd";
import {useNavigate} from "react-router-dom";
import {ArrowLeftOutlined} from "@ant-design/icons";
import './project.css';
import TypeSelector from "../public/TypeSelector";
import PropTypes from "prop-types";
import dayjs from "dayjs"

const TYPE_CREATE = "create";
const TYPE_EDIT = "edit";
const COLOR_PRESETS = [
    {label: '常用颜色', colors: ['#1677FF', '#52C41A', '#FAAD14', '#FF4D4F', '#722ED1', '#13C2C2', '#EB2F96', '#FA8C16', '#A0D911', '#2F54EB']},
];

/**
 * 项目创建与编辑表单。
 *
 * @param {{data: object, onSubmit: function, type: string, hideNavigation: boolean, hideSubmitButton: boolean, onFormReady: function}} props 表单初始数据、提交回调、展示方式及表单实例回调
 */
const ProjectForm = ({data, onSubmit, type = TYPE_CREATE, hideNavigation = false, hideSubmitButton = false, onFormReady}) => {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [treeValue, setTreeValue] = useState();
    const [endDateDisabled,setEndDateDisabled] = useState(data?.isStartDateOnly ===1);
    const format = 'YYYY-MM-DD';

    /**
     * 将表单实例提供给弹窗页脚按钮调用。
     */
    useEffect(() => {
        onFormReady?.(form);
    }, [form, onFormReady]);

    const onFinish = (values) => {
        const params = {
            id:data.id,
            name: values.name,
            progress: values.progress ? Number(values.progress) : 0,
            important: values.important ,
            color: values.color || null,
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

            {!hideNavigation && <div>
                <ArrowLeftOutlined style={{
                    margin: '10px 20px', fontSize: '2em', color: 'grey', cursor: 'pointer'
                    , display: 'inline-block'
                }} onClick={() => {
                    navigate('/projects')
                }}/>
            </div>}

            <div className={'form-card'}>
                <Form
                    form={form}
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
                                <TypeSelector allowClear={true}
                                              value={treeValue}
                                              onChange={onTreeChange}
                                              style={{width: '100%'}}/>
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
                                label="颜色"
                                name="color"
                                labelAlign={'left'}
                                initialValue={data.customColor !== undefined ? data.customColor : data.color}
                                getValueFromEvent={(color, hex) => hex}
                            >
                                <ColorPicker
                                    allowClear
                                    showText
                                    presets={COLOR_PRESETS}
                                    onClear={() => form.setFieldValue("color", null)}
                                />
                            </Form.Item>
                        </Col>
                        {!hideSubmitButton && <Col span={24}>
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
                        </Col>}
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
