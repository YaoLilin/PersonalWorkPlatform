import {DatePicker, Input, Modal} from "antd";
import React, {useContext} from "react";
import TextArea from "antd/lib/input/TextArea";
import {ProblemsApis} from "../../request/problemApi";
import {MessageContext} from "../../provider/MessageProvider";
import LevelSelector from "./LevelSelector";
import PropTypes from "prop-types";
import dayjs from "dayjs";

// 问题编辑对话框，可用于新建问题和修改问题
const EditDialog = ({open, onCancel, onOk, data, onChange, type, canEditWeek}) => {
    const {title, level = 1, resolve, weekDate = dayjs().format('YYYY-MM-DD')} = data;
    const messageApi = useContext(MessageContext);

    const handleSubmit = () => {
        if (!title || !weekDate) {
            messageApi.error('标题和周次必填', 5)
            return
        }
        const params = {
            title,
            level,
            resolve,
            weekDate
        }
        if (type === 'add') {
            ProblemsApis.add(params).then(result => {
                messageApi.success('添加成功', 5)
                onChange({});
                onOk(result);
            });
        } else {
            ProblemsApis.updateProblems(data.id, params).then(result => {
                messageApi.success('修改成功', 5)
                onChange({});
                onOk(data);
            });
        }
    };

    const handleLevelChange = (v) => {
        const newData = {...data}
        newData.level = v;
        onChange(newData);
    }

    const handleResolveChange = (v) => {
        const newData = {...data}
        newData.resolve = v.target.value;
        onChange(newData);
    }

    const handleWeekChange = (e) => {
        const newData = {...data}
        newData.weekDate = e.day(1).format('YYYY-MM-DD');
        onChange(newData);
    }
    return (
        <Modal title={type === 'add' ? '添加' : '修改'} open={open}
               onOk={handleSubmit}
               onCancel={onCancel}>
            <div>
                <div style={{display: 'flex', paddingTop: 10}}>
                    <div style={{width: 120}}>标题</div>
                    <div style={{width: 300}}>
                        <Input onChange={v => {
                            const newData = {...data}
                            newData.title = v.target.value;
                            onChange(newData);
                        }}
                               value={title}
                        />
                    </div>
                </div>
                <div style={{display: 'flex', paddingTop: 10}}>
                    <div style={{width: 120}}>所属周</div>
                    <div style={{width: 200}}>
                        <DatePicker picker="week"
                                    onChange={handleWeekChange}
                                    value={dayjs(weekDate)}
                                    disabled={canEditWeek === undefined ? false : !canEditWeek}
                        />
                    </div>
                </div>
                <div style={{display: 'flex', paddingTop: 10}}>
                    <div style={{width: 120}}>级别</div>
                    <div style={{width: 200}}>
                        <LevelSelector value={level} onSelect={handleLevelChange}/>
                    </div>
                </div>
                <div style={{paddingTop: 10}}>
                    <div style={{width: 120}}>解决方法</div>
                    <div style={{paddingTop: 10}}>
                        <TextArea onChange={handleResolveChange}
                                  autoSize={{minRows: 3}}
                                  value={resolve}
                        />
                    </div>
                </div>
            </div>
        </Modal>
    )
}

EditDialog.defaultProps = {
    open:false,
    type: 'add',
    onCancel:()=>{},
    onOk:()=>{},
    data: {},
    onChange:()=>{},
    canEditWeek: true
}

EditDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    type: PropTypes.string.isRequired,
    onCancel: PropTypes.func.isRequired,
    onOk: PropTypes.func.isRequired,
    data: PropTypes.object.isRequired,
    onChange: PropTypes.func,
    canEditWeek: PropTypes.bool
}

export default EditDialog;