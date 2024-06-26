import React, {useState} from "react";
import EditDialog from "../../components/problems/EditDialog";

export default function useProblemEditDialog(handleAfterEditDialogOk) {
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editDialogData, setEditDialogData] = useState({});
    const [editDialogType, setEditDialogType] = useState('add');

    const handleEditDialogOk = () => {
        setEditDialogOpen(false);
        handleAfterEditDialogOk();
    }

    const dialog = <EditDialog open={editDialogOpen}
                               onOk={handleEditDialogOk}
                               onCancel={() => setEditDialogOpen(false)}
                               data={editDialogData}
                               type={editDialogType}
                               onChange={(data) => setEditDialogData({...data})}/>;
    return {dialog,setEditDialogType,setEditDialogData,setEditDialogOpen}
}