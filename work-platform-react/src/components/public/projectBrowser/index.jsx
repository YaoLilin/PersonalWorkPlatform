import {CloseCircleOutlined, SearchOutlined} from "@ant-design/icons";
import React, {useContext, useState} from "react";
import Browser from "./BrowserDialog";
import PropTypes from "prop-types";
import {ThemeContext} from "@/provider/ThemProvider";
import ProjectBrowserEditModal from "./ProjectBrowserEditModal";

/**
 * 项目浏览框。
 *
 * @param {Object} props 组件参数
 * @param {Function} props.onChange 选择项目变化时的回调
 * @param {boolean} props.multiple 是否多选
 * @param {Object|Object[]} props.value 项目数据，包含 id 和 name
 * @param {Object} props.style 外层样式
 * @param {boolean} props.editable 是否可编辑
 * @returns {JSX.Element} 项目浏览框
 */
const ProjectBrowser = ({onChange,multiple,value,style={},editable = true}) => {
    const [showBrowser,setShowBrowser] = useState(false);
    const [selectedProjectIds, setSelectedProjectIds] = useState([]);
    const [editingProjectId, setEditingProjectId] = useState(null);
    const [editedNames, setEditedNames] = useState({});
    const {styleColor} = useContext(ThemeContext);

    const handelClickRow = (id, name) => {
        setShowBrowser(false)
        onChange({id, name});
    }

    const handleBrowserSelectedKeysChange = (keys)=>{
        setSelectedProjectIds(keys);
    }

    const handleBrowserOk = (data) =>{
        setShowBrowser(false);
        if (multiple) {
            onChange(data.map((project) => ({id: project.key, name: project.name})));
        }
    }

    const handleClean = ()=>{
        if (multiple) {
            onChange([]);
            setSelectedProjectIds([]);
        }else {
            onChange(null);
        }
    }

    const selectedProjects = multiple ? (value || []) : value ? [value] : [];
    const showCleanBt = multiple ? value && value.length >0 : value && value.name ;
    const nameStyle = !multiple ?  {
        textOverflow:'ellipsis',
        whiteSpace:'nowrap'
    } : null;
    return editable ? (
        <div style={{
            width:140,
            minWidth:0,
            height:32,
            boxSizing:'border-box',
            background: 'white',
            border: '1px solid #d9d9d9',
            borderRadius: '6px',
            padding: '0 11px',
            display: 'flex',
            alignItems: 'center',
            ...style,
        }}>
            <div style={{ flex:'1 1 auto', minWidth:0, color: 'rgb(37 146 250)',overflow:"hidden",...nameStyle}}>
                {selectedProjects.map((project, index) => <span
                    key={project.id}
                    style={{cursor: 'pointer'}}
                    onClick={() => setEditingProjectId(project.id)}
                >{index > 0 ? ", " : ""}{editedNames[project.id] || project.name}</span>)}
            </div>
            <div style={{flex:'0 0 auto', color: 'rgba(0, 0, 0, 0.25)', display: 'flex', alignItems: 'center', gap: 8}}>
                {showCleanBt &&
                    <CloseCircleOutlined   style={{cursor:'pointer'}}
                                           onClick={handleClean}/>
                }

                <SearchOutlined
                    style={{cursor:'pointer'}}
                    onClick={() => {
                        if (multiple) setSelectedProjectIds(selectedProjects.map((project) => project.id));
                        setShowBrowser(true);
                    }}
                />
            </div>
            <Browser visible={showBrowser}
                     onCancel={() => setShowBrowser(false)}
                     isMultiple={multiple}
                     onClickRow={handelClickRow}
                     onOk={handleBrowserOk}
                     selectedProjectIds={selectedProjectIds}
                     onSelectedKeysChange={handleBrowserSelectedKeysChange}
            />
            <ProjectBrowserEditModal
                projectId={editingProjectId}
                onClose={() => setEditingProjectId(null)}
                onSaved={(project) => setEditedNames((names) => ({...names, [project.id]: project.name}))}
            />
        </div>
    ) :
        (<div>
            <span style={{color: styleColor.accentColor,cursor:'pointer'}}>
                {selectedProjects.map((project) => editedNames[project.id] || project.name).join(", ")}
            </span>
        </div>)
}
ProjectBrowser.prototype={
    onChange:PropTypes.func,
    value: PropTypes.oneOfType([PropTypes.object,PropTypes.array]),
    style:PropTypes.object
}
export default ProjectBrowser;
