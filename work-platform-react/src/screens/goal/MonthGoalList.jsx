import GoalApi from "../../request/goalApi";
import {useLoaderData} from "react-router-dom";
import {useContext, useState} from "react";
import dayjs from "dayjs";
import {Button} from "antd/lib";
import {PlusOutlined} from "@ant-design/icons";
import GoalList from "../../components/goal/List";
import {MessageContext} from "../../provider/MessageProvider";
import handleLoaderError from "../../util/handleLoaderError";
import "./goal-list.css";

export async function loader(){
    try {
        return await GoalApi.getMonthGoals();
    } catch (e) {
        handleLoaderError(e);
    }
}

const MonthGoalList = ()=>{
    const data = useLoaderData();
    const [list, setList] = useState(data);
    const messageApi = useContext((MessageContext));

    function onClickAdd() {
        const year = dayjs().year();
        const month = dayjs().month()+1;
        for (let i = 0; i < list.length; i++) {
            const item = list[i];
            if (item.year === year && item.month === month) {
                messageApi.info("info", "已经存在当前周，请前往修改", 5);
                return;
            }
        }
        const newData = [{year,month,goals:[]},...list];
        setList(newData);
    }

    return (
        <main className="goal-page">
            <header className="goal-page__hero">
                <div>
                    <p className="goal-page__eyebrow">GOALS</p>
                    <h1>月目标</h1>
                    <p>以月为单位沉淀方向，让长期计划持续向前推进。</p>
                </div>
                <Button className="goal-page__create-button" icon={<PlusOutlined/>} type="primary" onClick={onClickAdd}>添加本月目标</Button>
            </header>
            <div className="goal-page__grid">
                {list.map((item, index) => (
                    <GoalList
                        cardMode
                        data={item.goals}
                        goalType={'month'}
                        key={index}
                        month={item.month}
                        year={item.year}
                        onChange={(newData) => {
                                        const newList = list.slice();
                                        newList.forEach(i => {
                                            if (i.year === item.year && i.month === item.month) {
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

export default MonthGoalList;
