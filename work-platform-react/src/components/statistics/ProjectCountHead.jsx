import PropTypes from "prop-types";
import ProjectCountFoot from "./ProjectCountFoot";

const ProjectCountHead = ({cellStyle,borderColor}) => {
    return (
        <div style={{backgroundColor: 'rgb(250, 250, 250)'}}>
            <div style={{
                ...cellStyle,
                borderRight: borderColor,
                borderBottom: borderColor
            }}>
                项目
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