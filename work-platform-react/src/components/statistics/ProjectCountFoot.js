import PropTypes from "prop-types";

const ProjectCountFoot = ({cellStyle,borderColor,allTime}) => {

    return(
        <div style={{display: "flex"}}>
            <div style={{
                ...cellStyle,
                borderRight: borderColor,
                backgroundColor: 'rgb(250, 250, 250)',
            }}>
                总计
            </div>
            <div style={{
                ...cellStyle,
                borderRight: borderColor,
            }}>
                {allTime}
            </div>
            <div style={{
                ...cellStyle,
                borderRight: borderColor,
            }}>
                {(allTime / 60).toFixed(2)}
            </div>
            <div style={{
                ...cellStyle,
            }}></div>
        </div>
    )
}

ProjectCountFoot.defaultProps = {
    cellStyle: {
        height: '36px',
        lineHeight: '36px',
        width: '25%',
        display: 'inline-block'
    },
    borderColor: 'solid 1px rgb(240, 240, 240)',
    allTime: 0,
}
ProjectCountFoot.prototype = {
    cellStyle: PropTypes.object,
    borderColor: PropTypes.string,
    allTime: PropTypes.number,
}

export default ProjectCountFoot;