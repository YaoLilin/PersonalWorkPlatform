import TypeNameInput from "./TypeNameInput";
import * as Prototype from "prop-types";


const TypeAddDialogContent = ({defaultValue='',onChange, showInputError})=>{
    return(
        <TypeNameInput onChange={onChange} showInputError={showInputError} defaultValue={defaultValue}/>
    )
}

TypeAddDialogContent.prototype={
    defaultValue : Prototype.string,
    onChange:Prototype.func,
    showInputError:Prototype.bool
}

export default TypeAddDialogContent;