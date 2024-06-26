import {Modal} from "antd";
import React, {useState} from "react";

export default function useDialog(icon,title,content,onOk) {
    const [open, setOpen] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const dialog = <Modal
        title={<div style={{display: "flex",height:'1.5em',alignItems:'center'}}>
            {icon}
            <p style={{paddingLeft: 10}}>{title}</p>
        </div>}
        open={open}
        onOk={onOk}
        confirmLoading={deleteLoading}
        onCancel={() => {
            setOpen(false);
            setDeleteLoading(false)
        }}
    >
        <p>{content}</p>
    </Modal>

    return {
        dialog, setOpen
    }
};