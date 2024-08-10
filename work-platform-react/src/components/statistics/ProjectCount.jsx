import ProjectCountItem from "./ProjectCountItem";
import ProjectCountHead from "./ProjectCountHead";
import ProjectCountFoot from "./ProjectCountFoot";

const ProjectCount = (props) => {
    const {data} = props;
    let allTime = 0;
    data?.forEach(item => allTime += item.minutes);
    data?.sort((a, b) => b.minutes - a.minutes);
    const cellStyle = {
        height: '36px',
        lineHeight: '36px',
        width: '25%',
        display: 'inline-block'
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
                <ProjectCountHead cellStyle={cellStyle} borderColor={borderColor}/>
                {getRow()}
                <ProjectCountFoot cellStyle={cellStyle} borderColor={borderColor} allTime={allTime}/>
            </div>
        </div>
    )
}

export default ProjectCount;