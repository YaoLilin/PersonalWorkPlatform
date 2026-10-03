import FieldLabel from "../../ui/FieldLabel";
import {Select} from "antd";
import ProjectBrowser from "../../public/projectBrowser";
import TypeSelector from "../../public/TypeSelector";
import {useState} from "react";

/**
 * 图表的统计维度及项目、类型筛选条件。
 *
 * @param {{onChange: Function}} props 条件变化回调。
 * @returns {JSX.Element} 图表通用筛选控件。
 */
const CommonCondition = ({onChange}) => {
    const [selectedCountType, setSelectedCountType] = useState(0);
    const [selectedProject, setSelectedProject] = useState([]);
    const [selectedType, setSelectedType] = useState([]);

    const handleCountTypeChange = (value) => {
        setSelectedCountType(value);
        onChange({countType:value, projects:selectedProject.map(i => i.id), types:selectedType})
    }

    const handleProjectChange = (data) => {
        setSelectedProject(data);
        onChange({countType:selectedCountType, projects:data.map(i => i.id), types:selectedType})
    }

    const handleTypeChange = (value) => {
        setSelectedType(value);
        onChange({countType:selectedCountType, projects:selectedProject.map(i => i.id), types:value})
    }


    return (
        <div style={{display: 'flex', flexWrap: 'wrap', gap: 10}}>
            <FieldLabel name={'统计维度'}>
                <Select style={{width: 120}}
                        size={"small"}
                        value={selectedCountType}
                        onChange={handleCountTypeChange}>
                    <Select.Option value={0}>项目和清单</Select.Option>
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
