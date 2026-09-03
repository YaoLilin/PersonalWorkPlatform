import React, {useContext, useMemo, useState} from "react";
import {useLoaderData, useNavigate, useParams} from "react-router-dom";
import {Form, Row} from "antd";
import FormTitle from "../../components/ui/FormTitle";
import {WeeksApi} from "../../request/weeksApi";
import dayjs from "dayjs";
import FormFrame from "../../components/statistics/form/FormFrame";
import {useForm} from "antd/es/form/Form";
import ProjectCount from "../../components/statistics/ProjectCount";
import GoalApi from "../../request/goalApi";
import GoalList from "../../components/goal/List";
import {MessageContext} from "../../provider/MessageProvider";
import {merger} from "../../util/ProjectTimeUtil";
import SummaryTextArea from "../../components/statistics/form/SummaryTextArea";
import MarkSelector from "../../components/statistics/form/MarkSelector";
import WeekSelector from "../../components/statistics/form/WeekSelector";
import FormProblemList from "../../components/statistics/form/FormProblemList";
import useWeekFormSubmit from "./useWeekFormSubmit";
import FullRow from "../../components/statistics/form/FullRow";
import useDeleteDialog from "./useDeleteDialog";
import useHeadMenus from "./useHeadMenus";
import handleLoaderError from "../../util/handleLoaderError";
import ProjectProgressList from "@/components/statistics/form/ProjectProgressList";
import WorkTimePieChart from "../../components/statistics/charts/WorkTimePieChart";
import DateUtil from "../../util/DateUtil";
import ScheduleApi from "../../request/scheduleApi";
import WeekSchedule from "./WeekSchedule";


export async function loader({params}) {
    try {
        const weekId = params.weekId;
        const [formData, scheduleEvents] = await Promise.all([
            weekId ? WeeksApi.getForm(weekId) : {},
            ScheduleApi.getSchedule(),
        ]);
        const goalsResult = await GoalApi.getWeekGoals({weekDate:formData.date});
        const goals = goalsResult.length > 0 ? goalsResult[0].goals : [];
        return {formData, goals, scheduleEvents};
    } catch (e) {
        handleLoaderError(e);
    }
}

const WeekForm = ({isFormCreate = false}) => {
    const {formData,goals:goalList, scheduleEvents} = useLoaderData();
    const {date, mark, summary,projectProgressList} = formData;
    const navigate = useNavigate();
    const [form] = useForm();
    // 项目进行时间数据，用于表格
    const projectTimeData = useMemo(() => {
        if (formData?.projectTime) {
            return formData.projectTime.map((i, index) => ({ key: i.id, ...i }));
        }
        return [];
    }, [formData?.projectTime]);
    const [tableData] = useState(projectTimeData);
    const [theWeekProblems, setTheWeekProblems] = useState(formData?.theWeekProblems ? formData.theWeekProblems : []);
    const [nowProblems, setNowProblems] = useState(formData.nowProblems);
    const [weekValue, setWeekValue] = useState(date ? dayjs(date) : null);
    const [goals, setGoals] = useState(goalList);
    const [projectProgress, setProjectProgress] = useState(projectProgressList ? projectProgressList : []);
    const {weekId: weekIdFromParam} = useParams();
    const messageApi = useContext(MessageContext);
    // 每个项目的占用时间统计
    const projectTimeCount = useMemo(()=>{
        return merger(tableData);
    },[tableData]);
    const handleSubmit = useWeekFormSubmit(isFormCreate, tableData, theWeekProblems, projectTimeCount, weekIdFromParam
                         ,projectProgress);
    const {deleteDialog, setDeleteDialogOpen} = useDeleteDialog(weekIdFromParam);
    const {headButtons,dropMenu,editAble} =
        useHeadMenus(form, isFormCreate,()=> setDeleteDialogOpen(true));
    debugger

    const fetchGoals = async (date)=>{
        const year = dayjs(date).year();
        const weekNumber = dayjs(date).week();
        try {
            const result = await GoalApi.getWeekGoals({year, weekNumber});
            if (result.length > 0) {
                return result[0].goals;
            }
        } catch (e) {
            messageApi.error("获取目标失败", 5);
        }
        return [];
    }

    const handleWeekChange = async (date)=> {
        setWeekValue(date);
        if (!date) {
            setGoals([]);
        }else {
            const goals = await fetchGoals(date);
            setGoals(goals);
        }
    }

    /**
     * <p>获取当前周的利用时间占比统计条件。</p>
     *
     * @returns {Object} 当前周的自定义日期统计条件
     */
    const getChartCondition = () => {
        const {startDate, endDate} = DateUtil.getWeekRangeByDate(date);
        return {dateRangeType: 3, startDate, endDate};
    };

    return (
        <FormFrame backEvent={() => navigate('/weeks')}
                   dropMenu={dropMenu}
                   buttons={headButtons}
                   >
            {deleteDialog}
            <Form
                name="basic"
                labelCol={{
                    span: 4,
                }}
                form={form}
                wrapperCol={{
                    span: 8,
                }}
                autoComplete="off"
                onFinish={handleSubmit}
                method={'post'}
                scrollToFirstError={true}
                initialValues={{
                    week: date ? dayjs(date, 'YYYY-MM-DD') : '',
                    mark: mark,
                    summary: summary
                }}
            >
                <Row gutter={0} justify="start">
                    <WeekSelector editAble={editAble}
                                  isFormCreate={isFormCreate}
                                  onWeekChange={handleWeekChange}
                                  value={formData?.date}/>
                    <MarkSelector editAble={editAble} value={formData.mark} />
                </Row>
                <FormTitle name='项目情况'/>
                <FullRow>
                    <WeekSchedule
                        weekDate={weekValue?.format("YYYY-MM-DD")}
                        scheduleEvents={scheduleEvents}
                    />
                </FullRow>
                <FormTitle name='任务统计'/>
                <Row gutter={0}>
                    <ProjectCount data={projectTimeCount}/>
                </Row>
                <Row>
                    {
                        !editAble && projectTimeCount.length > 0 ?
                            <div style={{width: 500, height: 300}}>
                                <WorkTimePieChart
                                    showCondition={false}
                                    showLegend={false}
                                    defaultCondition={getChartCondition()}
                                />
                            </div> : null
                    }
                </Row>
                <FormTitle name='项目成果'/>
                <FullRow>
                    <ProjectProgressList data={projectProgress} isEditable={editAble}
                                         onChange={(data) => setProjectProgress(data)}/>
                </FullRow>
                <FormTitle name='目标'/>
                <FullRow>
                    <GoalList data={goals} showTitle={false} onChange={(data) => setGoals(data)}/>
                </FullRow>
                <FormTitle name='问题'/>
                <FormProblemList isFormCreate={isFormCreate}
                                 theWeekProblems={theWeekProblems}
                                 nowProblems={nowProblems}
                                 weekValue={weekValue}
                                 onTheWeekProblemsListChange={(data) => setTheWeekProblems(data)}
                                 onNowProblemsListChange={(data)=>setNowProblems(data)}
                                 editAble={editAble}/>
                <FormTitle name='总结'/>
                <Row gutter={0}>
                    <SummaryTextArea editAble={editAble} value={formData.summary}/>
                </Row>
            </Form>
        </FormFrame>
    )
}

export default WeekForm;
