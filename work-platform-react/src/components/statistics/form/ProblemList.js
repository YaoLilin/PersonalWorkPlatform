import {PlusCircleOutlined} from "@ant-design/icons";
import ProblemItem from "./ProblemItem";
import dayjs from "dayjs";
import {ProblemsApis} from "../../../request/problemApi";

const ProblemList = ({data, onChange, week, removeAble =false, editAble,addAble = false, defaultEdit}) => {

    const onRemove = (id) => {
        const newData = data.filter(item => item.id !== id);
        onChange(newData);
    }

    const onClickAdd = () => {
        const newData = {
            id: new Date().getTime(),
            weekDate: week ? week.day(1).format('YYYY-MM-DD') : '',
            isEdit : true
        };
        const newProblemList = data.slice();
        newProblemList.push(newData);
        onChange(newProblemList);
    }

    const onDoneProblem = (id) => {
        ProblemsApis.done(id).then(result => {
            const updateData = data.slice();
            for (let i = 0; i < updateData.length; i++) {
                if (updateData[i].id === id) {
                    // 标记为已完成
                    updateData[i].state = 1;
                }
            }
            onChange(updateData);
        })
    }

    const updateProblemList =(newData)=>{
        const newProblemList = data.slice();
        for (let i = 0; i < newProblemList.length; i++) {
            if (newProblemList[i].id === newData.id) {
                newProblemList[i] = newData;
            }
        }
        onChange(newProblemList);
    }

    return (
        <div>
            {
                addAble || defaultEdit ?
                    <div>
                        {/*添加按钮*/}
                        <PlusCircleOutlined
                            style={{cursor: "pointer", fontSize: '1.5em', color: 'grey', width: 40, height: 40}}
                            onClick={onClickAdd}/>
                    </div> : null
            }
            {
                data?.map((item, index) => {
                    return (<ProblemItem key={item.id}
                                         num={index + 1}
                                         data={item} edit={true}
                                         onDone={onDoneProblem}
                                         onRemove={onRemove}
                                         onChange={updateProblemList}
                                         onEditDone={updateProblemList}
                                         removeAble={removeAble}
                                         editAble={editAble}
                                         defaultEdit={item.isEdit}
                    />)
                })
            }
        </div>
    )
}

export default ProblemList;