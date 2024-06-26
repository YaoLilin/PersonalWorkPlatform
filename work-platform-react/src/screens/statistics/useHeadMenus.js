import {Button} from "antd";
import React, {useState} from "react";

export default function useHeadMenus(form, isFormCreate, onClickDelete) {
    const [editAble, setEditAble] = useState(isFormCreate);
    const submitBt = <Button type={"primary"}
                             style={{float: "right", marginRight: "20px"}}
                             onClick={() => form.submit()}>提交</Button>;
    const backBt = <Button style={{float: "right", marginRight: "20px"}}
                           onClick={() => window.location.reload()}>返回</Button>;
    const editBt = <Button type={"primary"} style={{float: "right", marginRight: "20px"}}
                           onClick={() => setEditAble(true)}>编辑</Button>;
    const dropMenu = [];
    if (isFormCreate) {
        dropMenu.push({
            key: '0',
            danger: true,
            label: '删除',
            onClick: onClickDelete
        })
    }
    const headButtons =  isFormCreate || editAble ? [submitBt, backBt] : [editBt];
    return {headButtons,dropMenu, editAble};
}