import PropTypes from "prop-types";

const ProjectCountItem = ({data, isBottom, allTime,cellStyle, borderColor}) => {
    const border = isBottom ? {borderBottom: borderColor} : {};
    return (
        <div key={data.name}
             style={border}>
            <div style={{
                ...cellStyle,
                borderRight: borderColor
            }}>{data.name}</div>
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
                {(data.minutes / allTime * 100).toFixed(0)}
            </div>
        </div>
    );
}

ProjectCountItem.defaultProps = {
    isBottom: false,
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
    isBottom:PropTypes.bool.isRequired,
    allTime:PropTypes.number.isRequired,
}
export default ProjectCountItem;