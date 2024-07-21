import FieldLabel from "../../../util/FieldLabel";
import {Select} from "antd";
import ProjectBrowser from "../../public/projectBrowser";
import TypeSelector from "../../public/TypeSelector";
import React, {useState} from "react";

const CommonCondition = ({onChange}) => {
    const [selectedCountType, setSelectedCountType] = useState(0);
    const [selectedProject, setSelectedProject] = useState([]);
    const [selectedType, setSelectedType] = useState([]);

    const handleCountTypeChange = (value) => {
        setSelectedCountType(value);
        onChange({countType:value,projects:selectedProject.map(i => i.key),types:selectedType.map(i => i.key)})
    }

    const handleProjectChange = (data) => {
        setSelectedProject(data);
        onChange({countType:selectedCountType,projects:data.map(i => i.key),types:selectedType.map(i => i.key)})
    }

    const handleTypeChange = (value) => {
        setSelectedType(value);
        onChange({countType:selectedCountType,projects:selectedProject.map(i => i.key),types:value})
    }


    return (
        <div style={{display: 'flex', gap: 20}}>
            <FieldLabel name={'统计纬度'}>
                <Select style={{width: '100px'}}
                        size={"small"}
                        value={selectedCountType}
                        onChange={handleCountTypeChange}>
                    <Select.Option value={0}>项目</Select.Option>
                    <Select.Option value={1}>类型</Select.Option>
                </Select>
            </FieldLabel>
            {selectedCountType === 0 &&
                <FieldLabel name={'项目'}>
                    <ProjectBrowser value={selectedProject}
                                    multiple
                                    onChange={handleProjectChange}/>
                </FieldLabel>
            }
            {selectedCountType === 1 &&
                <FieldLabel name={'类型'}>
                    <TypeSelector multiple
                                  value={selectedType}
                                  allowClear
                                  style={{width: 180}}
                                  onChange={handleTypeChange}/>
                </FieldLabel>
            }
        </div>
    )
}

export default CommonCondition;