import {Button, Input, Select, Tag} from "antd";
import {CheckCircleOutlined, EditOutlined, MinusCircleOutlined} from "@ant-design/icons";
import React, {useContext, useState} from "react";
import TextArea from "antd/es/input/TextArea";
import {ProblemsApis} from "../../../request/problemApi";
import OrderNumber from "../../ui/OrderNumber";
import {MessageContext} from "../../../provider/MessageProvider";
import FieldLabel from "@/components/ui/FieldLabel";

const ProblemItem = ({num, data, onRemove, onEditDone, onDone, removeAble,onChange,editAble ,defaultEdit=false}) => {
    const {id, resolve, state, title,level} = data;
    if (defaultEdit) {
        editAble = false;
    }
    // 编辑状态，处于true时可编辑标题、解决方法等内容
    const [edit, setEdit] = useState(false);
    const messageApi = useContext(MessageContext);
    const params ={
        title,resolve,level
    }

    const getTag = () => {
        if (!edit && !defaultEdit) {
            if (!state || state === 0) {
                return (
                    <div style={{overflow:"hidden"}}>
                        <div style={{float: 'right'}}>
                            <Tag color={'orange'} >未解决</Tag>
                        </div>
                    </div>

                );
            }
            return (
                <div style={{overflow:"hidden"}}>
                    <div style={{float: 'right'}}>
                        <Tag color={'blue'} style={{marginInlineEnd:'0'}}>已解决</Tag>
                    </div>
                </div>
            )
        }
    }

    function onClickEdit() {
        setEdit(true);
    }

    function getTitle() {
        if (edit || defaultEdit) {
            return (
                <FieldLabel style={{marginTop: 10}} name={'标题'} labelWidth={100}>
                    <Input placeholder={'请输入标题'}
                           defaultValue={title}
                           onChange={v => {
                               params.title = v.target.value;
                               data.title = v.target.value;
                               onChange(data);
                           }}/>
                </FieldLabel>
            )
        }
        return (
            <div style={{padding: '0 4px', borderBottom: 'solid #ccc 1px'}}>
                {title}
            </div>
        )
    }

    function getResolveTextArea() {
        if (edit || defaultEdit) {
            return (
                <FieldLabel name={'解决方法'} labelWidth={100} style={{width:'100%',marginTop: 4}}>
                    <TextArea  placeholder={'请输入解决方法'}
                               defaultValue={resolve}
                               onChange={v => {
                                   params.resolve = v.target.value;
                                   data.resolve = v.target.value;
                                   onChange(data);
                               }}/>
                </FieldLabel>
            )
        }
        return (
            <div style={{overflow: "hidden",display:'flex',paddingTop: 10}}>
                <div>解决方法：</div>
                {
                    resolve && <div>{resolve}</div>
                }
            </div>
        )
    }

    function getRemoveBt() {
        if (removeAble || defaultEdit) {
            return (
                <MinusCircleOutlined style={{fontSize: '1.5em', color: '#ff6060', cursor: "pointer"}}
                                     onClick={() => onRemove(id)}/>
            )
        }
    }

    function gerEditBt() {
        if (editAble && !edit) {
            return (
               <EditOutlined style={{fontSize: '1.5em', color: '#2f87fa', cursor: "pointer"}}
                                          onClick={onClickEdit}/>
            )
        }
    }

    function getEditOperationBt() {
        if (edit && !defaultEdit) {
            return(
                <>
                    <div style={{float:'right'}}>
                        <Button onClick={() => setEdit(false)}>取消</Button>
                    </div>
                    <div style={{float:'right',paddingRight:10}}>
                        <Button type={"primary"} onClick={onProblemEditDone}>完成</Button>
                    </div>
                </>

            )
        }
    }

    function onProblemEditDone() {
        setEdit(false);
        ProblemsApis.updateProblems(id, params).then(resolve =>{
            const newData = {...data};
            newData.title = params.title;
            newData.resolve = params.resolve;
            newData.level = params.level;
            onEditDone(newData);
            messageApi.success('问题更新成功',5);
        }).catch( e =>{
            messageApi.error('更新问题失败',5);
        })
    }

    function getProblemDoneBt() {
        if (!edit && !defaultEdit && state !== 1) {
            return (
                <div style={{textAlign: 'left'}}>
                    <CheckCircleOutlined
                        style={{color: '#464646', fontSize: '1.5em', cursor: 'pointer'}}
                        title={'完成'}
                        onClick={() => onDone(id)}
                    />
                </div>
            )
        }
    }

    function getLevelSelector() {
        if (edit || defaultEdit) {
            return(
                    <FieldLabel name={'级别'} labelWidth={85} style={{paddingTop: 10}}>
                        <div style={{width: 120}}>
                            <Select options={[
                                {
                                    value: 1,
                                    label: '低',
                                },
                                {
                                    value: 2,
                                    label: '高',
                                },
                            ]}
                                    defaultValue={level}
                                    onSelect={v => {
                                        params.level = v;
                                        data.level = v;
                                        onChange(data);
                                    }}
                                    style={{width: 80}}
                            />
                        </div>
                    </FieldLabel>
            )
        }
    }

    return (
        <div style={{padding: "10px 0"}}>
            <div style={{overflow: "hidden", display: 'flex'}}>
                <div>
                    <OrderNumber number={num}/>
                </div>
                <div style={{
                    backgroundColor: 'rgb(250, 250, 250)',
                    border: 'solid 1px #eee',
                    borderRadius: '8px',
                    display:"flex",
                    padding: '10px 20px',
                    marginLeft: 10,
                }}>
                    <div style={{
                        width: 600
                    }}>
                        {getTitle()}
                        {getResolveTextArea()}
                        {getLevelSelector()}
                        {getEditOperationBt()}
                    </div>
                    <div style={{display: 'flex',justifyContent:'flex-start',paddingLeft:10}}>
                        {getTag()}
                    </div>
                </div>

                <div style={{lineHeight: '30px', paddingLeft: 10, width: 40}}>
                    {getRemoveBt()}
                    {gerEditBt()}
                    {getProblemDoneBt()}
                </div>

            </div>
        </div>
    );
}

export default ProblemItem;
