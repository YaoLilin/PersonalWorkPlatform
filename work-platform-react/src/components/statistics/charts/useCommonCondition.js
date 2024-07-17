import FieldLabel from "../../../util/FieldLabel";
import {Select} from "antd";
import ProjectBrowser from "../../public/projectBrowser";
import TypeSelector from "../../public/TypeSelector";
import React, {useState} from "react";

const useCommonCondition = () => {
    const [selectedCountType, setSelectedCountType] = useState(0);
    const [selectedProject, setSelectedProject] = useState([]);
    const [selectedType, setSelectedType] = useState([]);
    const handleCountTypeChange = (value) => {
        setSelectedCountType(value);
    }

    const handleProjectChange = (data) => {
        setSelectedProject(data);
    }

    const handleTypeChange = (value) => {
        setSelectedType(value);
    }


    const commonConditionCom =( <div style={{display: 'flex', gap: 20}}>
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
                                    onChange={handleProjectChange} />
                </FieldLabel>
            }
            {selectedCountType === 1 &&
                <FieldLabel name={'类型'}>
                    <TypeSelector multiple
                                  value={selectedType}
                                  allowClear
                                  style={{width:180}}
                                  onChange={handleTypeChange}/>
                </FieldLabel>
            }
        </div>
    )
    return {commonConditionCom,selectedCountType,selectedProject,selectedType}
}

export default useCommonCondition;