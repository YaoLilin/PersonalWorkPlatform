import {Tag} from "antd";
import {useNavigate} from "react-router-dom";
import DateUtil from "../../../util/DateUtil";

const InfoCard = ({data,title,onClick,bottomFlag,style}) => {
    const {mark, hours,minutes, projectTime, summary,id} = data;

    const getMarkColor = (mark)=>{
        if (mark === 1){
            return 'red';
        }else if (mark === 2){
            return 'green';
        }else if (mark === 3){
            return 'blue';
        }
    }

    const getMarkText = (mark)=>{
        if (mark === 1){
            return '不合格';
        }else if (mark === 2){
            return '合格';
        }else if(mark === 3){
            return '优秀';
        }
    }

    if (projectTime) {
        projectTime.sort((a,b) => b.minutes - a.minutes);
    }

    return (
        <div style={{
            width: 350,
            height: 350,
            backgroundColor: "white",
            borderRadius: "12px",
            padding: "20px",
            cursor: "pointer",
            marginRight:'40px',
            position:"relative",
            ...style
        }} onClick={()=>onClick(id)}>
            <div>
                {title}
            </div>
            <div style={{paddingTop: "10px"}}>
                <span>评价：</span>
                <span>
                    {mark ? <Tag color={getMarkColor(mark)}>{getMarkText(mark)}</Tag> : null}
                </span>
            </div>
            <div style={{paddingTop: "10px"}}>
                <span>利用时间：{hours} 小时</span>
                <span style={{paddingLeft:4}}>{minutes ? minutes+' 分钟' : ''}</span>
            </div>
            <div style={{paddingTop: "10px"}}>
                项目时间：
            </div>
            <div>
                {projectTime.map((item,index) =>{
                    return (
                        <div style={{display: "flex", paddingTop: 4}} key={index}>
                            <div style={{flex:2, overflow: "hidden"}}>{item.projectName}</div>
                            <div style={{flex:1}}>{item.minutes}min</div>
                            <div style={{flex:1}}>{item.hours}h</div>
                            <div style={{flex:1}}>{item.percent}%</div>
                        </div>
                    )
                })}
            </div>
            <div style={{paddingTop: "10px"}}>
                总结：
            </div>
            <div>
                {summary}
            </div>
            {bottomFlag}
        </div>
    );
}
export default InfoCard;