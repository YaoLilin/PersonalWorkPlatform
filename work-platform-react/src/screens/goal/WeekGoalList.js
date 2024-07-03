import GoalList from "../../components/goal/List";
import GoalApi from "../../request/goalApi";
import {useLoaderData} from "react-router-dom";
import {Button} from "antd/lib";
import {PlusOutlined} from "@ant-design/icons";
import dayjs from "dayjs";
import {useContext, useState} from "react";
import {MessageContext} from "../../provider/MessageProvider";
import handleLoaderError from "../../util/handleLoaderError";

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
        const year = dayjs().year();
        const weekNumber = dayjs().week();
        for (let i = 0; i < list.length; i++) {
            const item = list[i];
            if (item.year === year && item.weekNumber === weekNumber) {
                messageApi.info("已经存在当前周，请前往修改", 5);
                return;
            }
        }
        const newData = [{year,weekNumber,goals:[]},...list];
        setList(newData);
    }

    return (
        <div>
            <div style={{padding:'10px 0'}}>
                <Button icon={<PlusOutlined />} onClick={onClickAdd}>添加</Button>
            </div>

            {
                list.map((item,index)=>{
                    return(
                        <GoalList data={item.goals}
                                  weekNumber={item.weekNumber}
                                  year={item.year}
                                  goalType={'week'}
                                  key={index}
                                  style={{paddingTop:10}}
                                  onChange={(newData) => {
                                        const newList = list.slice();
                                        newList.forEach(i => {
                                            if (i.year === item.year && i.weekNumber === item.weekNumber) {
                                                i.goals = newData;
                                            }
                                        });
                                        setList(newList);
                        }}/>
                    )
                })
            }
        </div>
    )
}

export default WeekGoalList;