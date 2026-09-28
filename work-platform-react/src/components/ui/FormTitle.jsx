import React, {useContext} from "react";
import {Row} from "antd";
import {ThemeContext} from "../../provider/ThemProvider";


/**
 * 表单分节标题。
 * @param {{name: string, variant?: 'apple'}} props 标题文字和样式类型。
 */
export const FormTitle = (props)=>{
    const {styleColor} = useContext(ThemeContext);

    if (props.variant === 'apple') {
        return <Row gutter={0} className="week-form-section-title"><h2>{props.name}</h2></Row>;
    }

    return(
        <Row gutter={0}>
            <div style={{padding:'15px 0px',width:'100%'}}>
                <div style={{padding:'0px 10px',color:styleColor.accentColor,fontSize:'1.2em'}}>{props.name}</div>
                <div style={{borderBottom:'solid 1px #ccc',paddingTop:'10px'}}></div>
            </div>
        </Row>

    )
}

export default FormTitle;
