import {Button} from "antd/lib";
import OrderNumber from "../ui/OrderNumber";
import BrowserInput from "../public/projectBrowser";
import {Input} from "antd";
import {useState} from "react";

const GoalEditor = ({num, onCancel, onSubmit}) => {
    const [project, setProject] = useState({id: null, name: ''});
    const [content, setContent] = useState('');

    return (
        <div style={{display: 'flex', alignItems: 'center', paddingTop: 10}}>
            <OrderNumber number={num} style={{backgroundColor: '#ff8e3e', width: 25, height: 25, lineHeight: '25px'}}/>
            <BrowserInput style={{width: 180, marginLeft: 20}}
                          value={project} onChange={(id, name)=> setProject({id, name})}/>
            <Input placeholder={'请输入目标内容'} style={{marginLeft: 20, width: 400}} onChange={v => setContent(v.target.value) }/>
            <Button size={"small"} type={"primary"} style={{marginLeft: 20}}
                    onClick={() => onSubmit(project.id, project.name,content)}>完成</Button>
            <Button size={"small"} style={{marginLeft: 20}} onClick={onCancel}>取消</Button>
        </div>
    )
}

export default GoalEditor;