const ListTitle = ({title,littleTitle,buttons})=>{

    return(
        <div style={{borderBottom: '1px solid #ccc', fontSize: "2em"}}>
            <span>
                {title}
            </span>
            <span style={{paddingLeft:'20px',fontSize:14}}>{littleTitle}</span>
            <span style={{paddingLeft:20}}>
                {buttons}
            </span>

        </div>
    )
}

export default ListTitle;