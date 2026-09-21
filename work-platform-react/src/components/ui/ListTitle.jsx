/**
 * 列表分区标题。
 *
 * @param {{title: React.ReactNode, littleTitle?: React.ReactNode, buttons?: React.ReactNode}} props 主标题、辅助标题和操作按钮。
 * @returns {JSX.Element} 列表分区标题。
 */
const ListTitle = ({title,littleTitle,buttons})=>{

    return(
        <div className="list-section-title">
            <span className="list-section-title__main">
                {title}
            </span>
            <span className="list-section-title__sub">{littleTitle}</span>
            <span className="list-section-title__actions">
                {buttons}
            </span>

        </div>
    )
}

export default ListTitle;
