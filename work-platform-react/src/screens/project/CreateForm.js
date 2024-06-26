import React, {useContext} from "react";
import {useNavigate} from "react-router-dom";
import {ProjectApi} from "../../request/projectApi";
import ProjectForm from "../../components/project/Form";
import {MessageContext} from "../../provider/MessageProvider";


const CreateForm = () => {
    const navigate = useNavigate();
    const messageApi = useContext(MessageContext);

    const onSubmit = (params) => {
        ProjectApi.addProject(params).then(result => {
            navigate('/projects');
        }).catch(error => {
            messageApi.error('数据添加失败！',5);
        })
    };

    const data = {
        name:'',
        type:'',
        progress:'',
        state:'',
        important:'',
        startDate :'',
        endDate:'',
        closeDate:'',
    }

    return (
        <>
            <ProjectForm onSubmit={onSubmit} data={data} type={'create'}/>
        </>
    )
}

export default CreateForm;