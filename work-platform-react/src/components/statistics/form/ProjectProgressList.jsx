import React, {useContext, useState} from 'react';
import {Button, Input, Checkbox} from 'antd';
import ProjectBrowser from "@/components/public/projectBrowser";
import {MessageContext} from "@/provider/MessageProvider";
import {ThemeContext} from "@/provider/ThemProvider";

/**
 *
 * @param data 数据 [{projectId:1,projectName:'xx',progress:'xx',isNew:true}]
 * @param isEditable 是否可编辑
 * @param onChange {function} onChange(data)
 */
const ProjectProgressList = ({data =[], isEditable,onChange}) => {
    const messageApi = useContext(MessageContext);
    const [selectedItems, setSelectedItems] = useState([]);

    const handleAdd = () => {
        onChange([...data, {id:new Date().getTime(),achievement: ''}]);
    };

    const handleMultiDelete = () => {
        const newProjects =  data.filter((item, index)=> !selectedItems.includes(index));
        onChange(newProjects);
        setSelectedItems([]);
    };

    const handleInputChange = (index,value) => {
        const newProjects = [...data];
        newProjects[index].progress = value;
        onChange(newProjects);
    };

    const handleSelectChange = (index) => {
        if (selectedItems.includes(index)) {
            setSelectedItems(selectedItems.filter(item => item !== index));
        } else {
            setSelectedItems([...selectedItems, index]);
        }
    };

    const handleProjectChange = (index, projectId, projectName) => {
        if (projectId &&  data.some(i => i.projectId === projectId)) {
            messageApi.error('已有相同项目');
            return;
        }
        const newProjects = [...data];
        newProjects[index].projectId = projectId;
        newProjects[index].projectName = projectName;
        onChange(newProjects);
    };

    return (
        <div>
            {isEditable && (
                <div>
                    <Button onClick={handleAdd}>添加</Button>
                    {selectedItems.length > 0 && (
                        <Button onClick={handleMultiDelete} style={{marginLeft:10}}>删除选中</Button>
                    )}
                </div>
            )}
            <ul>
                {data.map((data,index) => (
                    <li key={data.projectId} style={{display: 'flex', alignItems: 'center', marginTop: 10}}>
                        <div style={{display: "flex", flex: 1}}>
                            {isEditable && (
                                <Checkbox
                                    checked={selectedItems.includes(index)}
                                    onChange={() => handleSelectChange(index)}
                                />
                            )}
                            <ProjectBrowser
                                value={{name:data.projectName}}
                                editable={isEditable}
                                onChange={(value) => handleProjectChange(index, value?.id, value?.name)}
                                style={{margin: '0px 10px',width:200}}
                            />
                            {isEditable ? (
                                <Input
                                    value={data.progress}
                                    onChange={(e) => handleInputChange(index, e.target.value)}
                                    style={{flex: 1}}
                                />
                            ) : (
                                <span style={{flex: 1}}>：{data.progress}</span>
                            )}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ProjectProgressList;
