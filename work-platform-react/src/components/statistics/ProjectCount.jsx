import ProjectCountItem from "./ProjectCountItem";
import ProjectCountHead from "./ProjectCountHead";
import ProjectCountFoot from "./ProjectCountFoot";

/**
 * 任务工时汇总表。
 * @param {{data: Array, columnName?: string}} props 统计行与首列标题。
 */
const ProjectCount = (props) => {
    const {data, columnName = '项目'} = props;
    let allTime = 0;
    data?.forEach(item => allTime += item.minutes);
    data?.sort((a, b) => b.minutes - a.minutes);
    const cellStyle = {
        minHeight: '36px',
        width: '25%',
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '8px 6px',
        overflowWrap: 'anywhere'
    }
    const borderColor  = 'solid 1px rgb(240, 240, 240)';

    const getRow = () => {
        const content = [];
        let index = 0;
        const count = data.length;
        data?.forEach((item) => {
            index++;
            content.push(<ProjectCountItem data={item}
                                           key={index}
                                           isBottom={count === index}
                                           allTime={allTime}
                                           cellStyle={cellStyle}
                                           borderColor={borderColor}/>)
        });
        return content;
    }

    return (
        <div>
            <div style={{width: 600, border: borderColor, textAlign: 'center'}}>
                <ProjectCountHead cellStyle={cellStyle} borderColor={borderColor} columnName={columnName}/>
                {getRow()}
                <ProjectCountFoot cellStyle={cellStyle} borderColor={borderColor} allTime={allTime}/>
            </div>
        </div>
    )
}

export default ProjectCount;
