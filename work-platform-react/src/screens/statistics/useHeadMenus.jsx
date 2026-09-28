import {Button} from "antd";
import React, {useState} from "react";

/** 表单顶部操作按钮；options 用于控制创建页返回按钮及编辑取消文案。 */
export default function useHeadMenus(form, isFormCreate, onClickDelete, options = {}) {
    const [editAble, setEditAble] = useState(isFormCreate);
    const submitBt = <Button type={"primary"}
                             style={{float: "right", marginRight: "20px"}}
                             onClick={() => form.submit()}>提交</Button>;
    const backBt = <Button style={{float: "right", marginRight: "20px"}}
                           onClick={() => window.location.reload()}>{options.cancelLabel || '返回'}</Button>;
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
    const headButtons = isFormCreate
        ? (options.hideCreateCancel ? [submitBt] : [submitBt, backBt])
        : (editAble ? [submitBt, backBt] : [editBt]);
    return {headButtons,dropMenu, editAble};
}
