
const SeparatorText = (props)=>{
    const {text,style} = props;
    return (
    <div style={{textAlign:"center",width:'100%',...style}}>
        <div style={{borderTop:'solid 1px #ccc',top:'12px',position:"relative",zIndex:1}}></div>
        <span style={{position:"relative",padding:'0 10px',zIndex:2,backgroundColor:'white'}}>{text}</span>
    </div>
    )
}

export default SeparatorText;