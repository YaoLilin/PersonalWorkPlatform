import PropTypes from "prop-types";
import {Tag} from "antd";

/**
 * 单个项目或清单的工时统计行。
 * @param {{data: Object, allTime: number, cellStyle: Object, borderColor: string}} props 统计行及表格样式。
 */
const ProjectCountItem = ({data, allTime,cellStyle, borderColor}) => {
    return (
        <div key={data.name}
             style={{display: 'flex', borderBottom: borderColor}}>
            <div style={{
                ...cellStyle,
                borderRight: borderColor
            }}>
                {data.name}
                {data.isChecklist && <Tag style={{marginLeft: 6, marginRight: 0, fontSize: 10,
                    color: '#1677ff', background: '#fff', borderColor: '#e6e6e6', borderRadius: 8}}>清单</Tag>}
            </div>
            <div style={{
                ...cellStyle,
                borderRight: borderColor
            }}>{data.minutes}</div>
            <div style={{
                ...cellStyle,
                borderRight: borderColor
            }}>{(data.minutes / 60).toFixed(2)}</div>
            <div style={{
                ...cellStyle,
            }}>
                {
                    allTime ? (data.minutes / allTime * 100).toFixed(0) : 0
                }
            </div>
        </div>
    );
}

ProjectCountItem.defaultProps = {
    allTime: 0,
    data: {
        name: '',
        minutes: 0
    },
    cellStyle: {
        height: '36px',
        lineHeight: '36px',
        width: '25%',
        display: 'inline-block'
    },
    borderColor: 'solid 1px rgb(240, 240, 240)'
}
ProjectCountItem.prototype={
    data:PropTypes.object.isRequired,
    allTime:PropTypes.number.isRequired,
}
export default ProjectCountItem;
