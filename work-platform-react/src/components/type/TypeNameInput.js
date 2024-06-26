import {Input} from "antd";
import {useState} from "react";
import PropTypes from "prop-types";

const TypeNameInput = ({onChange,defaultValue=''}) => {
    const [showInputError,setShowInputError] = useState(false);
    return(
        <div style={{display:"flex"}}>
            <div style={{width:100,display:'inline-block'}}>类型名称：</div>
            <div>
                <Input style={{width: '200px'}}  onChange={e => {
                    onChange(e);
                    setShowInputError(!e.target.value);
                }} defaultValue={defaultValue}/>
                <div style={{color: 'red', display: showInputError ? 'block' : 'none'}}>值不能为空！</div>
            </div>

        </div>
    )
}

TypeNameInput.prototype={
    onChange : PropTypes.func,
    defaultValue : PropTypes.string
}
export default TypeNameInput;