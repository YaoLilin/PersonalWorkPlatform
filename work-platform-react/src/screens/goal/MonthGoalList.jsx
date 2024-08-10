import GoalApi from "../../request/goalApi";
import {useLoaderData} from "react-router-dom";
import {useContext, useState} from "react";
import dayjs from "dayjs";
import {Button} from "antd/lib";
import {PlusOutlined} from "@ant-design/icons";
import GoalList from "../../components/goal/List";
import {MessageContext} from "../../provider/MessageProvider";
import handleLoaderError from "../../util/handleLoaderError";

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
        <div>
            <div style={{padding:'10px 0'}}>
                <Button icon={<PlusOutlined />} onClick={onClickAdd}>添加</Button>
            </div>
            {
                list.map((item,index)=>{
                    return(
                        <GoalList data={item.goals}
                                  month={item.month}
                                  year={item.year}
                                  goalType={'month'}
                                  style={{paddingTop:10}}
                                  key={index}
                                  onChange={(newData) => {
                                        const newList = list.slice();
                                        newList.forEach(i => {
                                            if (i.year === item.year && i.month === item.month) {
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

export default MonthGoalList;