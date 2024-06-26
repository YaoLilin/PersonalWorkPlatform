import React from "react";

const OrderNumber = ({number,style})=>{
    return(
            <div style={{
                width: 30,
                height: 30,
                textAlign: "center",
                borderRadius: 45,
                backgroundColor: '#ff6060',
                color: "white",
                lineHeight: '30px',
                ...style
            }}>
                {number}
            </div>
    )
}

export default OrderNumber;