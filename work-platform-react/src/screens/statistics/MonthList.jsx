import {Button, Tag} from "antd";
import {MonthsApi} from "../../request/monthsApi";
import {useLoaderData, useNavigate} from "react-router-dom";
import InfoCard from "../../components/statistics/list/InfoCard";
import ListTitle from "../../components/ui/ListTitle";
import {useContext, useEffect, useMemo, useState} from "react";
import {MessageContext} from "../../provider/MessageProvider";
import "./month-list.css";

/**
 * 加载月统计列表数据。
 *
 * @returns {Promise<Array>} 月统计记录。
 */
export async function loader() {
    return await MonthsApi.getMonthList({});
}

/**
 * 月统计记录列表页面。
 *
 * @returns {JSX.Element} 按年份分组的月统计卡片及年份导航。
 */
const MonthList = () => {
    const data = useLoaderData();
    const navigate = useNavigate();
    const messageApi = useContext(MessageContext);
    const [activeYear, setActiveYear] = useState();
    const yearGroups = useMemo(() => {
        // key：年份；value：该年份下的月统计记录。
        const cardMap = new Map();
        data.forEach((month) => {
            const monthList = cardMap.get(month.year) ?? [];
            monthList.push(month);
            cardMap.set(month.year, monthList);
        });
        return Array.from(cardMap, ([year, months]) => ({
            year,
            months,
            targetId: `month-year-${year}`
        }));
    }, [data]);

    // 根据年份分区的滚动位置同步左侧年份导航的高亮状态。
    useEffect(() => {
        const updateActiveYear = () => {
            const currentGroup = yearGroups.reduce((current, group) => {
                const groupElement = document.getElementById(group.targetId);
                return groupElement?.getBoundingClientRect().top <= 150 ? group : current;
            }, yearGroups[0]);
            setActiveYear(currentGroup?.year);
        };

        updateActiveYear();
        window.addEventListener("scroll", updateActiveYear, true);
        return () => window.removeEventListener("scroll", updateActiveYear, true);
    }, [yearGroups]);

    /**
     * 平滑滚动至选择的年份分区。
     *
     * @param {string} targetId 年份分区的页面元素标识。
     */
    const scrollToYear = (targetId) => {
        document.getElementById(targetId)?.scrollIntoView({behavior: "smooth", block: "start"});
    };

    const bottomFlag = <Tag color={'red'}
                            style={{position: 'absolute', bottom: '30px', right: "20px", fontSize: '1em'}}>
        未总结
    </Tag>

    const reCount = () => {
        MonthsApi.reCount().then(() => {
            messageApi.success("重新统计成功", 5);
            window.setTimeout(() => window.location.reload(), 1000);
        }).catch(() => {
            messageApi.error("重新统计失败", 5);
        })
    }

    return (
        <main className="month-list">
            <Button
                className="month-list__recount-button"
                onClick={reCount}
            >
                重新统计
            </Button>
            <div className="month-list__body">
                <aside aria-label="月记录年份导航" className="month-time-navigation">
                    {yearGroups.map((group) => (
                        <Button
                            className={`month-time-navigation__year${activeYear === group.year ? " month-time-navigation__year--active" : ""}`}
                            key={group.year}
                            type="text"
                            onClick={() => scrollToYear(group.targetId)}
                        >
                            {group.year}
                        </Button>
                    ))}
                </aside>
                <div className="month-list__content">
                    {yearGroups.map((group) => (
                        <section className="month-list__year-section" id={group.targetId} key={group.year}>
                            <ListTitle title={`${group.year}年`}/>
                            <div className="statistics-list-grid">
                                {group.months.map((item) => (
                                    <InfoCard
                                        bottomFlag={!item.isSummarize ? bottomFlag : null}
                                        data={item}
                                        key={item.id}
                                        style={{marginTop: 0}}
                                        title={<span style={{fontSize: "1.5em"}}>{item.month}月</span>}
                                        onClick={(id) => navigate(`form/${id}`)}
                                    />
                                ))}
                            </div>
                        </section>
                    ))}
                </div>
            </div>
        </main>
    );
};

export default MonthList;
