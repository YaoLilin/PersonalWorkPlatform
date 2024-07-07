import {CloseCircleOutlined, SearchOutlined} from "@ant-design/icons";
import React, {useState} from "react";
import Browser from "./BrowserDialog";
import PropTypes from "prop-types";

const ProjectBrowser = ({onChange,multiple,value,style={}}) => {
    const [showBrowser,setShowBrowser] = useState(false);
    const [selectedProjectIds, setSelectedProjectIds] = useState([]);

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
            onChange(data);
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

    const showName = multiple ? value.map(v=>v.name).join(',') : value?.name;
    const showCleanBt = multiple ? value && value.length >0 : value;
    const nameStyle = !multiple ?  {
        textOverflow:'ellipsis',
        whiteSpace:'nowrap'
    } : null;

    return (
        <div style={{
            width:140,
            minWidth:120,
            background: 'white',
            border: '1px solid #d9d9d9',
            borderRadius: '6px',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            ...style,
        }}>
            <div style={{ flex:'7', color: 'rgb(37 146 250)',overflow:"hidden",...nameStyle}}>
                <span style={{cursor:'pointer'}}>{showName}</span>
            </div>
            <div style={{flex:'3',color: 'rgba(0, 0, 0, 0.25)', textAlign: 'center', display: 'inline-block'}}>
                {showCleanBt &&
                    <CloseCircleOutlined   style={{cursor:'pointer'}}
                                           onClick={handleClean}/>
                }

                <SearchOutlined
                    style={{marginLeft: '4px',cursor:'pointer'}}
                    onClick={() => setShowBrowser(true)}
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
        </div>
    )
}
ProjectBrowser.prototype={
    onChange:PropTypes.func,
    value: PropTypes.oneOfType([PropTypes.object,PropTypes.array]),
    style:PropTypes.object
}
export default ProjectBrowser;