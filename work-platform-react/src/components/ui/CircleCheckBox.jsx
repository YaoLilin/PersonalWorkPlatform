import React, {useContext, useState} from "react";
import {CheckOutlined} from "@ant-design/icons";
import {ThemeContext} from "../../provider/ThemProvider";

const CircleCheckBox = ({style,onChange,value})=>{
    const {styleColor} = useContext(ThemeContext);
    const border = value === 0 ? 'solid 1px rgb(169 169 169)' : 'none';
    const color = value === 1 ? 'white' : '';
    const backgroundColor = value === 1 ? styleColor.accentColor : 'white';

    return (
        <div style={{
            width: 20,
            height: 20,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 45,
            border:border,
            color: color,
            lineHeight: '25px',
            cursor:'pointer',
            backgroundColor:backgroundColor,
            ...style
        }} onClick={()=> {
            onChange(value === 0 ? 1 : 0);
        }}>
            { value === 1 && <CheckOutlined style={{fontSize: 10}}/>}
        </div>
    );
}

export default CircleCheckBox;