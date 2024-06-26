import {CloseCircleOutlined, SearchOutlined} from "@ant-design/icons";
import React, {useState} from "react";
import Browser from "./BrowserDialog";

const BrowserInput = ({onChange,value={id:null,name:''},style={}}) => {
    const [showBrowser,setShowBrowser] =useState(false);
    const handelSelected = (id, name) => {
        setShowBrowser(false)
        onChange(id,name);
    }
    return (
        <div style={{
            ...style,
            background: 'white',
            border: '1px solid #d9d9d9',
            borderRadius: '6px',
            padding: '4px'
        }}>
            <div style={{display: 'inline-block', width: '70%', color: 'rgb(37 146 250)'}}>
                <span style={{cursor:'pointer'}}>{value.name}</span>
            </div>
            <div style={{width: '30%', color: 'rgba(0, 0, 0, 0.25)', textAlign: 'center', display: 'inline-block'}}>
                <CloseCircleOutlined   style={{cursor:'pointer',visibility: (value.id !== null && value.id !== undefined) ? 'visible' : 'hidden'}}
                                       onClick={()=> onChange(null,null)}/>
                <SearchOutlined
                    style={{marginLeft: '4px',cursor:'pointer'}}
                    onClick={() => setShowBrowser(true)}
                />
            </div>
            <Browser visible={showBrowser}
                     onCancel={() => setShowBrowser(false)}
                     onSelected={handelSelected}
                     onOk={()=> setShowBrowser(false)}
            />
        </div>
    )
}
BrowserInput.prototype={
    onChange:Function,
    value:Object,
    style:Object
}
export default BrowserInput;