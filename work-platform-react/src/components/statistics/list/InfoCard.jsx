import {Tag} from "antd";
import ChecklistTag from "../ChecklistTag";
import "./statistics-card.css";

/**
 * 月统计记录展示卡片。
 *
 * @param {{data: {id: number, year: number, month: number, mark?: number, hours?: number, summary?: string, projectTime?: Array<{projectName: string, isChecklist?: boolean, minutes: number, percent: number}>}, title: React.ReactNode, onClick: Function, bottomFlag?: React.ReactNode, style?: Object}} props 月统计数据、标题、点击回调、状态标签和样式。
 * @returns {JSX.Element} 可进入月统计详情的卡片。
 */
const InfoCard = ({data, title, onClick, bottomFlag, style}) => {
    const {mark, hours, projectTime, summary, id, year, month} = data;
    const markMap = {
        1: {color: "red", text: "不合格"},
        2: {color: "green", text: "合格"},
        3: {color: "blue", text: "优秀"}
    };
    const markInfo = markMap[mark];
    const sortedProjectTime = [...(projectTime ?? [])]
        .sort((firstProject, secondProject) => secondProject.minutes - firstProject.minutes);

    return (
        <article
            aria-label={`${year}年${month}月统计`}
            className="statistics-card"
            onClick={() => onClick(id)}
            style={style}
        >
            <div className="statistics-card__header">
                <div>
                    <p className="statistics-card__eyebrow">MONTH {String(month).padStart(2, "0")}</p>
                    <h3>{title}</h3>
                </div>
                <div className="statistics-card__status">
                    {markInfo && <Tag color={markInfo.color}>{markInfo.text}</Tag>}
                    {bottomFlag}
                </div>
            </div>
            <p className="statistics-card__date">{year}年{month}月</p>
            <div className="statistics-card__duration">
                <span>消费时间</span>
                <strong>{hours ?? 0}<small> 小时</small></strong>
            </div>
            <div className="statistics-card__projects">
                <p>项目或清单时间</p>
                {sortedProjectTime.length > 0 ? sortedProjectTime.map((item) => (
                    <div
                        className="statistics-card__project"
                        key={`${item.isChecklist ? "checklist" : "project"}:${item.projectName}`}
                    >
                        <span className="statistics-card__name" title={item.projectName}>
                            <span className="statistics-card__name-text">{item.projectName}</span>
                            {item.isChecklist && <ChecklistTag/>}
                        </span>
                        <b>{item.percent}%</b>
                    </div>
                )) : <span className="statistics-card__empty">暂无项目或清单记录</span>}
            </div>
            <p className="statistics-card__summary">{summary || "暂未填写本月总结"}</p>
        </article>
    );
};

export default InfoCard;
