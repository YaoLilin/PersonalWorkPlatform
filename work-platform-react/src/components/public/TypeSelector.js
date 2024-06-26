import {TreeSelect} from "antd";
import React, {useEffect, useState} from "react";
import {TypeApi} from "../../request/typeApi";

const TypeSelector =  (props)=>{
    const [types,setTypes] = useState();

    useEffect(()=>{
        TypeApi.getTypeTree({}).then(result =>{
            setTypes(result);
        }).catch(error=>{
            console.error("获取types失败，"+error);
        })
    },[]);

    return(
        <TreeSelect {...props}
                    treeDefaultExpandAll
                    treeData={types}
                    style={{...props.style}}/>
    )
}

export default TypeSelector;