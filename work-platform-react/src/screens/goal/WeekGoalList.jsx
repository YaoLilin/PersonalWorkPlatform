import GoalList from "../../components/goal/List";
import GoalApi from "../../request/goalApi";
import {useLoaderData} from "react-router-dom";
import {Button} from "antd/lib";
import {PlusOutlined} from "@ant-design/icons";
import dayjs from "dayjs";
import {useContext, useState} from "react";
import {MessageContext} from "../../provider/MessageProvider";
import handleLoaderError from "../../util/handleLoaderError";
import "./goal-list.css";

export async function loader(){
    try {
        return await GoalApi.getWeekGoals();
    } catch (e) {
        handleLoaderError(e);
    }
}

const WeekGoalList = () => {
    const data = useLoaderData();
    const [list, setList] = useState(data);
    const messageApi = useContext((MessageContext));

    function onClickAdd() {
        const year = dayjs().day(1).year();
        const weekDate = dayjs().day(1).format('YYYY-MM-DD');
        for (let i = 0; i < list.length; i++) {
            const item = list[i];
            if (item.weekDate === weekDate) {
                messageApi.info("已经存在当前周，请前往修改", 5);
                return;
            }
        }
        const newData = [{year, weekDate,goals:[]},...list];
        setList(newData);
    }

    return (
        <main className="goal-page">
            <header className="goal-page__hero">
                <div>
                    <p className="goal-page__eyebrow">GOALS</p>
                    <h1>周目标</h1>
                    <p>将每周的重要计划收拢到清晰可执行的节奏中。</p>
                </div>
                <Button className="goal-page__create-button" icon={<PlusOutlined/>} type="primary" onClick={onClickAdd}>添加本周目标</Button>
            </header>
            <div className="goal-page__grid">
                {list.map((item, index) => (
                    <GoalList
                        cardMode
                        data={item.goals}
                        goalType={'week'}
                        key={index}
                        weekDate={item.weekDate}
                        onChange={(newData) => {
                                        const newList = list.slice();
                                        newList.forEach(i => {
                                            if (i.weekDate === item.weekDate) {
                                                i.goals = newData;
                                            }
                                        });
                                        setList(newList);
                        }}
                    />
                ))}
            </div>
        </main>
    );
};

export default WeekGoalList;
