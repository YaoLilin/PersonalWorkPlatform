import {ProjectApi} from "../../request/projectApi";
import ProjectForm from "../../components/project/Form"
import {useLoaderData} from "react-router-dom";
import React, {useContext} from "react";
import {MessageContext} from "../../provider/MessageProvider";


export async function loader({params}){
    return await ProjectApi.getProject(params.id);
}

const EditForm =  ()=>{
    const formData = useLoaderData();
    const messageApi = useContext(MessageContext);

    const onSubmit = (params) => {
        ProjectApi.updateProject(params.id,params).then(result => {
            messageApi.success('保存成功',5);
        }).catch(() => {
            messageApi.error('保存失败！',5);
        })
    };

    return (
        <>
            <ProjectForm onSubmit={onSubmit} data={formData} type={'edit'}/>
        </>
    )
}

export default EditForm;