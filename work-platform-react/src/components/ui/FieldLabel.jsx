import React from "react";


const fieldLabel = ({name,labelWidth,children,style}) => {
    return(
        <div style={{display: "flex", alignItems: 'center',...style}}>
            <span style={{width:labelWidth ? labelWidth : 'auto'}}>{name}：</span>
            {children}
        </div>
    )
}

export default fieldLabel;