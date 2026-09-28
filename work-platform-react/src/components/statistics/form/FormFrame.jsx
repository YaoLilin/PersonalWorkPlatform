import {ArrowLeftOutlined, DashOutlined} from "@ant-design/icons";
import {Button, Dropdown} from "antd";
import React from "react";

/**
 * 表单卡片及操作区。
 * @param {{backEvent: Function, dropMenu?: Array, buttons?: Array, title?: React.ReactNode, hideBack?: boolean, children: React.ReactNode}} props 表单内容与顶部操作。
 */
const FormFrame = (props)=>{
    const {backEvent,dropMenu,buttons,title,hideBack = false} = props;

    if (title) {
        return (
            <div className="week-form-frame form-card">
                <div className="week-form-frame__header">
                    <div className="week-form-frame__title">{title}</div>
                    <div className="week-form-frame__actions">
                        {!hideBack && <Button icon={<ArrowLeftOutlined/>} onClick={backEvent}>返回</Button>}
                        {buttons?.map((item, key) => <React.Fragment key={key}>{item}</React.Fragment>)}
                        {dropMenu?.length > 0 && <Dropdown menu={{items: dropMenu}}>
                            <Button icon={<DashOutlined/>} aria-label="更多操作"/>
                        </Dropdown>}
                    </div>
                </div>
                <div className="week-form-frame__body">{props.children}</div>
            </div>
        );
    }

    return (
        <div style={{height:'100%',overflowY:'auto'}}>
            <div style={{overflow:'hidden',padding:'10px 0'}}>
                <ArrowLeftOutlined style={{
                    margin: '10px 20px', fontSize: '2em', color: 'grey', cursor: 'pointer'
                    , display: 'inline-block'
                }} onClick={() => {
                    backEvent();
                }}/>
                <div style={{float: "right", marginRight: "20px"}}>
                    {
                        dropMenu?.length > 0 ? <Dropdown
                            menu={{items: dropMenu }}
                        >
                            <DashOutlined style={{fontSize: '2em'}}/>
                        </Dropdown> : null
                    }

                </div>
                {
                    buttons?.map((item,key)=>{
                        return <span key={key}> {item}</span>;
                    })
                }
            </div>

            <div className={'form-card'}>
                <div style={{maxWidth: '1000px', margin: '0 auto'}}>
                    {props.children}
                </div>
            </div>
        </div>
    )
}
export default FormFrame;
