import PropTypes from "prop-types";
import ProjectCountFoot from "./ProjectCountFoot";

/**
 * 汇总表表头。
 * @param {{cellStyle: Object, borderColor: string, columnName?: string}} props 单元格样式及标题。
 */
const ProjectCountHead = ({cellStyle,borderColor,columnName = '项目'}) => {
    return (
        <div style={{display: 'flex', backgroundColor: 'rgb(250, 250, 250)'}}>
            <div style={{
                ...cellStyle,
                borderRight: borderColor,
                borderBottom: borderColor
            }}>
                {columnName}
            </div>
            <div style={{
                ...cellStyle,
                borderRight: borderColor,
                borderBottom: borderColor
            }}>
                用时（分）
            </div>
            <div style={{
                ...cellStyle,
                borderRight: borderColor,
                borderBottom: borderColor
            }}>
                用时（小时）
            </div>
            <div style={{
                ...cellStyle,
                borderBottom: borderColor
            }}>
                占比(%)
            </div>
        </div>
    );
}

ProjectCountFoot.defaultProps = {
    cellStyle: {
        height: '36px',
        lineHeight: '36px',
        width: '25%',
        display: 'inline-block'
    },
    borderColor: 'solid 1px rgb(240, 240, 240)'
}
ProjectCountFoot.prototype = {
    cellStyle: PropTypes.object,
    borderColor: PropTypes.string
}

export default ProjectCountHead;
