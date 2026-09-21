import {Tag} from "antd";
import {useNavigate} from "react-router-dom";
import dayjs from "dayjs";

/**
 * Apple 风格的周统计卡片。
 *
 * @param {{data: {id: string|number, date: string, mark?: number, hours?: number, minutes?: number, summary?: string, projectTime?: Array<{projectName: string, minutes: number, hours: number, percent: number}>}}} props 卡片展示所需的周统计数据。
 * @returns {JSX.Element} 可进入周统计详情的卡片。
 */
const WeekCard = ({data}) => {
    const navigate = useNavigate();
    const endDate = dayjs(data.date).add(6, "day").format("YYYY-MM-DD");
    const weekNumber = dayjs(data.date).week();
    const projectTime = [...(data.projectTime ?? [])]
        .sort((firstProject, secondProject) => secondProject.minutes - firstProject.minutes);

    /**
     * 获取周评价对应的展示配置。
     *
     * @param {number|undefined} mark 周评价标识。
     * @returns {{color: string, text: string}|undefined} 标签展示配置。
     */
    const getMark = (mark) => {
        const markMap = {
            1: {color: "red", text: "不合格"},
            2: {color: "green", text: "合格"},
            3: {color: "blue", text: "优秀"}
        };
        return markMap[mark];
    };

    const mark = getMark(data.mark);

    return (
        <article
            aria-label={`第 ${weekNumber} 周统计`}
            className="week-statistics-card"
            onClick={() => navigate(`form/${data.id}`)}
        >
            <div className="week-statistics-card__header">
                <div>
                    <p className="week-statistics-card__eyebrow">WEEK {weekNumber}</p>
                    <h3>第 {weekNumber} 周</h3>
                </div>
                {mark && <Tag color={mark.color}>{mark.text}</Tag>}
            </div>
            <p className="week-statistics-card__date">{data.date} — {endDate}</p>
            <div className="week-statistics-card__duration">
                <span>专注时间</span>
                <strong>{data.hours ?? 0}<small> 小时</small></strong>
                {data.minutes ? <em>{data.minutes} 分钟</em> : null}
            </div>
            <div className="week-statistics-card__projects">
                <p>项目时间</p>
                {projectTime.length > 0 ? projectTime.map((project) => (
                    <div className="week-statistics-card__project" key={project.projectName}>
                        <span title={project.projectName}>{project.projectName}</span>
                        <b>{project.percent}%</b>
                    </div>
                )) : <span className="week-statistics-card__empty">暂无项目记录</span>}
            </div>
            <p className="week-statistics-card__summary">{data.summary || "暂未填写本周总结"}</p>
        </article>
    );
};

export default WeekCard;
