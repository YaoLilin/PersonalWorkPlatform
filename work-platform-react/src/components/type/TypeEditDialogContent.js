import TypeNameInput from "./TypeNameInput";
import TypeSelector from "../public/TypeSelector";
import PropTypes from "prop-types";

const TypeEditDialogContent = ({onNameChange,onNodeSelectorChanged,name,parentNode})=>{
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
        </div>

    )
}

TypeEditDialogContent.protoTypes = {
    onNameChange:PropTypes.func,
    onNodeSelectorChanged:PropTypes.func,
    showInputError:PropTypes.bool,
    name:PropTypes.string,
    parentNode:PropTypes.string
}

export default TypeEditDialogContent;