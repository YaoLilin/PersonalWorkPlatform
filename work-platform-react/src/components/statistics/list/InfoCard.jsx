import {Tag} from "antd";
/**
 * 月统计记录展示卡片。
 *
 * @param {{data: Object, title: React.ReactNode, onClick: Function, bottomFlag?: React.ReactNode, style?: Object}} props 卡片展示数据、标题、交互回调和可选内容。
 * @returns {JSX.Element} 可点击的统计记录卡片。
 */
const InfoCard = ({data, title, onClick, bottomFlag, style}) => {
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

    const sortedProjectTime = [...(projectTime ?? [])].sort((firstProject, secondProject) =>
        secondProject.minutes - firstProject.minutes);

    return (
        <article className="statistics-info-card" style={{
            width: 350,
            position:"relative",
            overflow:"hidden",
            ...style
        }} onClick={() => onClick(id)}>
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
                {sortedProjectTime.map((item,index) =>{
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
            <div style={{
                overflow: "hidden",
                whiteSpace: "nowrap",
                textOverflow: "ellipsis"
            }}>
                {summary}
            </div>
            {bottomFlag}
        </article>
    );
}
export default InfoCard;
