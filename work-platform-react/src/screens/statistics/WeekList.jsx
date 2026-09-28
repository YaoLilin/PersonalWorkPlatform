import {Button, Empty} from "antd";
import {useLoaderData} from "react-router-dom";
import WeekCard from "../../components/statistics/list/WeekCard";
import {WeeksApi} from "../../request/weeksApi";
import {useEffect, useMemo, useState} from "react";
import dayjs from "dayjs";
import "./week-list.css";

/**
 * 加载周统计列表数据。
 *
 * @returns {Promise<Array>} 周统计记录。
 */
export async function loader() {
    return await WeeksApi.getWeekList({});
}

/**
 * 按年月分组周统计记录。
 *
 * @param {Array<{date: string}>} weeks 周统计记录。
 * @returns {Array<{id: string, year: number, month: number, weeks: Array}>} 年月分组后的记录。
 */
const groupWeeksByMonth = (weeks) => {
    // key：年份-月份；value：该月份的周统计记录分组。
    const groupMap = new Map();
    weeks.forEach((week) => {
        const date = dayjs(week.date);
        const groupKey = `${date.year()}-${date.month() + 1}`;
        const group = groupMap.get(groupKey) ?? {
            id: `week-month-${groupKey}`,
            year: date.year(),
            month: date.month() + 1,
            weeks: []
        };
        group.weeks.push(week);
        groupMap.set(groupKey, group);
    });
    return Array.from(groupMap.values());
};

/**
 * 周记录列表页面。
 *
 * @returns {JSX.Element} Apple 风格的周记录卡片及日期导航。
 */
const WeekList = () => {
    const data = useLoaderData();
    const [activeMonthId, setActiveMonthId] = useState();
    const weekGroups = useMemo(() => groupWeeksByMonth(data), [data]);
    const dateNavigation = useMemo(() => {
        // key：年份；value：该年份下的月份导航分组。
        const yearMap = new Map();
        weekGroups.forEach((group) => {
            const yearGroup = yearMap.get(group.year) ?? {
                year: group.year,
                targetId: group.id,
                months: []
            };
            yearGroup.months.push(group);
            yearMap.set(group.year, yearGroup);
        });
        return Array.from(yearMap.values());
    }, [weekGroups]);

    // 根据周记录列表的滚动位置同步侧边月份导航的高亮状态。
    useEffect(() => {
        const updateActiveMonth = () => {
            const currentGroup = weekGroups.reduce((current, group) => {
                const groupElement = document.getElementById(group.id);
                return groupElement?.getBoundingClientRect().top <= 150 ? group : current;
            }, weekGroups[0]);
            setActiveMonthId(currentGroup?.id);
        };

        updateActiveMonth();
        window.addEventListener("scroll", updateActiveMonth, true);
        return () => window.removeEventListener("scroll", updateActiveMonth, true);
    }, [weekGroups]);

    /**
     * 平滑滚动至选择的月份区块。
     *
     * @param {string} targetId 月份区块的页面元素标识。
     */
    const scrollToGroup = (targetId) => {
        setActiveMonthId(targetId);
        document.getElementById(targetId)?.scrollIntoView({behavior: "smooth", block: "start"});
    };

    return (
        <main className="week-list">
            <header className="week-list__hero">
                <div>
                    <p className="week-list__eyebrow">WORK INSIGHTS</p>
                    <h1>周统计</h1>
                    <p>回顾每一周投入的时间，沉淀稳定的工作节奏。</p>
                </div>
            </header>
            <div className="week-list__body">
                <aside aria-label="周记录时间导航" className="week-time-navigation">
                    {dateNavigation.map((yearGroup) => (
                        <section key={yearGroup.year} className="week-time-navigation__year-group">
                            <Button
                                className="week-time-navigation__year"
                                type="text"
                                onClick={() => scrollToGroup(yearGroup.targetId)}
                            >
                                {yearGroup.year}
                            </Button>
                            {yearGroup.months.map((monthGroup) => (
                                <Button
                                    className={`week-time-navigation__month${activeMonthId === monthGroup.id ? " week-time-navigation__month--active" : ""}`}
                                    key={monthGroup.id}
                                    type="text"
                                    onClick={() => scrollToGroup(monthGroup.id)}
                                >
                                    {monthGroup.month}月
                                </Button>
                            ))}
                        </section>
                    ))}
                </aside>
                <div className="week-list__content">
                    {weekGroups.length > 0 ? weekGroups.map((group) => (
                        <section className="week-list__month-section" id={group.id} key={group.id}>
                            <div className="week-list__month-heading">
                                <p>{group.year}</p>
                                <h2>{group.month}月</h2>
                            </div>
                            <div className="week-list__card-grid">
                                {group.weeks.map((week) => <WeekCard data={week} key={week.id}/>)}</div>
                        </section>
                    )) : <Empty className="week-list__empty" description="还没有周记录"/>}
                </div>
            </div>
        </main>
    );
};

export default WeekList;
