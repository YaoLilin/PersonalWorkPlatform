import ListTitle from "../ui/ListTitle";
import DateUtil from "../../util/DateUtil";
import {Button, message} from "antd";
import {AppstoreAddOutlined} from "@ant-design/icons";
import ListItem from "./ListItem";
import {useContext, useState} from "react";
import PropTypes from 'prop-types';
import GoalEditor from "./Editor";
import GoalApi from "../../request/goalApi";
import {MessageContext} from "../../provider/MessageProvider";
import {ThemeContext} from "../../provider/ThemProvider";

const GoalList = ({weekNumber=1,month=1,year,goalType ='week',data=[],
                      showTitle = true,onChange,style}) => {
    const [checkAble, setCheckAble] = useState(false);
    const [editGoals, setEditGoals] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const messageApi = useContext(MessageContext);
    const {startDate, endDate} = DateUtil.getWeekRange(weekNumber, year);
    const {styleColor} = useContext(ThemeContext);

    const handleEditGoalSubmit = async (id, projectId, projectName, content)=> {
        try {
            goalType === 'week' ? await GoalApi.addWeekGoals({projectId, content, weekNumber, year})
                : await GoalApi.addMonthGoals({projectId, content, month, year});
        } catch (e) {
            messageApi.error("添加目标出错",5);
            return;
        }
        const newData =  [...data];
        newData.push({projectId, projectName, content, id: new Date().getTime(), isDone: 0});
        onChange(newData);
        const newEditGoals = editGoals.filter(i => i.id !== id);
        setEditGoals(newEditGoals);
    }

    const handleGoalStateChange = async (id, value)=>{
        try {
           goalType === 'week' ? await GoalApi.changeWeekGoalState(id, value) : await GoalApi.changeMonthGoalState(id, value);
        } catch (e) {
            messageApi.error("更新目标状态出错",5);
            return
        }
        const newData = data.map(i => {
            if (i.id === id) {
                i.isDone = value;
            }
            return i;
        });
        onChange(newData);
    }

    const handleChecked = (id,check)=> {
        if (check) {
            const newKeys = selectedIds.slice();
            newKeys.push(id);
            setSelectedIds(newKeys);
        } else {
            const newKeys = selectedIds.slice().filter(i => i !== id);
            setSelectedIds(newKeys);
        }
    }

    const handleBatchDelete = async () => {
        try {
            let ids = selectedIds.join(',');
            let result = goalType ==='week' ? await GoalApi.batchWeekGoalDelete(ids) : await GoalApi.batchMonthGoalDelete(ids);
            if (!result) {
                messageApi.error('删除失败', 5);
                return;
            }
            setSelectedIds([]);
            let newData = data.filter(i => selectedIds.indexOf(i.id) === -1);
            onChange(newData);
        } catch (error) {
            console.error('Batch delete failed:', error);
            messageApi.error('删除失败', 5);
        }
    }

    const operationButtons = [
        <Button key={'add'} size={"small"} onClick={() => {
            const newData = [{id: new Date().getTime()},...editGoals];
            setEditGoals(newData);
        }}>添加</Button>,
        <Button key={'delete'} size={"small"}
                style={{marginLeft: 10}}
                onClick={handleBatchDelete}
                disabled={selectedIds.length === 0}>删除
        </Button>,
        <AppstoreAddOutlined key={'check'} style={{
            marginLeft: 20,
            fontSize: 18,
            color: checkAble ? styleColor.accentColor : '#3b3b3b',
            cursor: "pointer"
        }}
            onClick={() => setCheckAble(!checkAble)}/>
    ]

    return (
        <div style={{...style}}>{
            showTitle && <ListTitle
                title={goalType ==='week' ? weekNumber + '周' : month +'月'}
                littleTitle={goalType ==='week' ? startDate + ' ' + endDate : year+'年'}
                buttons={operationButtons}/>
            }
            {
                !showTitle && <div>{operationButtons}</div>
            }
            <div style={{paddingTop: 10}}>
                {
                    data.map((item, index) => {
                        return (
                            <ListItem data={item}
                                      num={index + 1}
                                      key={item.id}
                                      checkAble={checkAble}
                                      onChecked={(id,check)=> handleChecked(id, check)}
                                      onChange={(value) => handleGoalStateChange(item.id, value)}
                             />
                        )
                    })
                }
                {
                    editGoals.map((item, index) => {
                        return (
                            <GoalEditor num={data.length + index + 1} key={item.id}
                                        onCancel={() => setEditGoals(editGoals.filter(i => i.id !== item.id))}
                                        onSubmit={(projectId, projectName, content) => {
                                            handleEditGoalSubmit(item.id, projectId, projectName, content);
                                        }}/>
                        )
                    })
                }
            </div>

        </div>

    )
}

GoalList.prototype = {
    weekNumber : PropTypes.number,
    month : PropTypes.number,
    year:PropTypes.number,
    goalType:PropTypes.string.isRequired,
    data : PropTypes.array.isRequired,
    showTitle : PropTypes.bool,
    onChange : PropTypes.func.isRequired
}

export default GoalList;