import {ExclamationCircleFilled} from "@ant-design/icons";
import React, {useContext} from "react";
import {WeeksApi} from "../../request/weeksApi";
import {MessageContext} from "../../provider/MessageProvider";
import {useNavigate} from "react-router-dom";
import useDialog from "../../components/public/useDialog";

export default function useDeleteDialog(weekId) {
    const messageApi = useContext(MessageContext);
    const navigate = useNavigate();
    const icon = <ExclamationCircleFilled style={{fontSize: '1.5em', color: 'rgb(250, 173, 20)'}}/>
    const {dialog, setOpen} = useDialog(
        icon,
        '删除确认',
        '确定要删除该记录吗？',
        () => {
            setOpen(true);
            WeeksApi.deleteRecord(weekId).then(() => {
                messageApi.success("删除成功", 5);
                navigate('/weeks');
            });
        });

    return {
        deleteDialog: dialog, setDeleteDialogOpen: setOpen
    }
};