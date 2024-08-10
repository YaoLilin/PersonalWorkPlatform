import {ArrowLeftOutlined, DashOutlined} from "@ant-design/icons";
import {Dropdown} from "antd";
import React from "react";

const FormFrame = (props)=>{
    const {backEvent,dropMenu,buttons} = props;

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