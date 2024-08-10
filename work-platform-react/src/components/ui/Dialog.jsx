import {Modal} from "antd";
import React from "react";
import PropTypes from "prop-types";

const Dialog = ({icon, title, visible, onOk, confirmLoading, onCancel,content})=>{

    return (
        <Modal
            title={<div style={{display: "flex"}}>
                {icon}
                <p style={{paddingLeft: 10}}>{title}</p>
            </div>}
            open={visible}
            onOk={onOk}
            confirmLoading={confirmLoading}
            onCancel={onCancel}
        >
            <p>{content}</p>
        </Modal>
    )
}

Dialog.defaultProps = {
    icon: null,
    title: "提示",
    visible: false,
    onOk: ()=>{},
    confirmLoading: false,
    onCancel: ()=>{},
    content: ""
}

Dialog.prototype = {
    icon : PropTypes.element,
    title : PropTypes.string.isRequired,
    visible : PropTypes.bool.isRequired,
    onOk : PropTypes.func.isRequired,
    confirmLoading : PropTypes.bool,
    onCancel : PropTypes.func.isRequired,
    content : PropTypes.string.isRequired
}

export default Dialog;
