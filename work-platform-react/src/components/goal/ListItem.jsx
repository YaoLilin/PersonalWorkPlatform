import OrderNumber from "../ui/OrderNumber";
import CircleCheckBox from "../ui/CircleCheckBox";
import {Checkbox} from "antd/lib";

const ListItem =({data,num,checkAble,onChange,onChecked})=>{
    const {id,projectId,projectName,content,isDone} = data;

    return(
        <div style={{display: 'flex',alignItems:'center',paddingTop:14}}>
            {checkAble && <Checkbox style={{marginRight:20}} onChange={(e) => onChecked(id,e.target.checked)}/>}
            <OrderNumber number={num} style={{backgroundColor:'#ff8e3e',width:20,height:20,lineHeight:'20px'}}/>
            <div style={{paddingLeft:20}}>{projectName} : {content}</div>
            <CircleCheckBox style={{marginLeft:20}} value={isDone} onChange={onChange}/>
        </div>
    )
}

export default ListItem;