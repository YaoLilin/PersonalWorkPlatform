import TypeNameInput from "./TypeNameInput";
import * as Prototype from "prop-types";
import {ColorPicker} from "antd";
import {useState} from "react";

const COLOR_PRESETS = [{label: "常用颜色", colors: ["#1677FF", "#52C41A", "#FAAD14", "#FF4D4F", "#722ED1", "#13C2C2", "#EB2F96", "#FA8C16", "#A0D911", "#2F54EB"]}];

/**
 * 类型新增弹窗内容。
 *
 * @param {Object} props 组件参数
 * @param {string} props.defaultValue 默认名称
 * @param {Function} props.onChange 名称变化回调
 * @param {boolean} props.showInputError 是否提示名称错误
 * @param {string} props.color 默认颜色；不传时不展示颜色选择
 * @param {Function} props.onColorChange 颜色变化回调
 * @returns {JSX.Element} 新增表单
 */
const TypeAddDialogContent = ({defaultValue='',onChange, showInputError, color, onColorChange})=>{
    const [selectedColor, setSelectedColor] = useState(color);
    return(
        <div>
            <TypeNameInput onChange={onChange} showInputError={showInputError} defaultValue={defaultValue}/>
            {onColorChange && <div style={{padding: "8px 0", display: "flex", alignItems: "center"}}>
                <span style={{width: 100}}>颜色：</span>
                <ColorPicker
                    showText
                    value={selectedColor}
                    presets={COLOR_PRESETS}
                    onChange={(value, hex) => {
                        setSelectedColor(hex);
                        onColorChange(hex);
                    }}
                />
            </div>}
        </div>
    )
}

TypeAddDialogContent.prototype={
    defaultValue : Prototype.string,
    onChange:Prototype.func,
    showInputError: Prototype.bool,
    color: Prototype.string,
    onColorChange: Prototype.func
}

export default TypeAddDialogContent;
