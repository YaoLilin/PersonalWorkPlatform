import TypeNameInput from "./TypeNameInput";
import TypeSelector from "../public/TypeSelector";
import PropTypes from "prop-types";
import {ColorPicker} from "antd";

const COLOR_PRESETS = [
    {label: "常用颜色", colors: ["#1677FF", "#52C41A", "#FAAD14", "#FF4D4F", "#722ED1", "#13C2C2", "#EB2F96", "#FA8C16", "#A0D911", "#2F54EB"]},
];

/**
 * 类型编辑对话框内容。
 *
 * @param {{onNameChange: Function, onNodeSelectorChanged: Function, onColorChange: Function, name: string, parentNode: number|null, color: string|null}} props 类型编辑参数
 * @param {Function} props.onNameChange 修改类型名称的回调
 * @param {Function} props.onNodeSelectorChanged 修改父类型的回调
 * @param {Function} props.onColorChange 修改类型颜色的回调
 * @param {string} props.name 类型名称
 * @param {number|null} props.parentNode 父类型标识
 * @param {string|null} props.color 类型颜色
 * @returns {JSX.Element} 对话框内容
 */
const TypeEditDialogContent = ({onNameChange, onNodeSelectorChanged, onColorChange, name, parentNode, color}) => {
    return(
        <div>
            <TypeNameInput onChange={onNameChange} defaultValue={name}/>
            <div style={{padding:'4px 0',display:'flex'}}>
                <div style={{width:100,display:'inline-block'}}>父节点：</div>
                <TypeSelector onChange={onNodeSelectorChanged}
                              defaultValue = {parentNode}
                              style={{width: '200px'}}
                              allowClear/>
            </div>
            <div style={{padding: "4px 0", display: "flex", alignItems: "center"}}>
                <div style={{width: 100, display: "inline-block"}}>颜色：</div>
                <ColorPicker
                    allowClear
                    showText
                    value={color}
                    presets={COLOR_PRESETS}
                    onChange={(value, hex) => onColorChange(hex)}
                    onClear={() => onColorChange(null)}
                />
            </div>
        </div>

    )
}

TypeEditDialogContent.propTypes = {
    onNameChange:PropTypes.func,
    onNodeSelectorChanged:PropTypes.func,
    onColorChange: PropTypes.func,
    showInputError:PropTypes.bool,
    name:PropTypes.string,
    parentNode:PropTypes.string,
    color: PropTypes.string
}

export default TypeEditDialogContent;
