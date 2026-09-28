import {Col, Form, Row, Select} from "antd";
import React, {useContext, useState} from "react";
import {MonthsApi} from "../../request/monthsApi";
import FormTitle from "../../components/ui/FormTitle";
import FormFrame from "../../components/statistics/form/FormFrame";
import {useLoaderData, useNavigate, useParams} from "react-router-dom";
import ProjectCount from "../../components/statistics/ProjectCount";
import MarkTag from "../../components/statistics/form/MarkTag";
import {ProblemsApis} from "../../request/problemApi";
import ProblemList from "../../components/statistics/form/ProblemList";
import dayjs from "dayjs";
import {MessageContext} from "../../provider/MessageProvider";
import useHeadMenus from "./useHeadMenus";
import SummaryTextArea from "../../components/statistics/form/SummaryTextArea";
import handleLoaderError from "../../util/handleLoaderError";
import WorkTimePieChart from "../../components/statistics/charts/WorkTimePieChart";
import GoalList from "../../components/goal/List";
import FullRow from "../../components/statistics/form/FullRow";
import GoalApi from "../../request/goalApi";
import "./week-form.css";

export async function loader({params}) {
    try {
        const monthData = await MonthsApi.getMonth(params.monthId);
        const startDate = monthData.year +'-'+monthData.month+'-01';
        const endDate = dayjs(startDate).endOf("month").format("YYYY-MM-DD");
        const problemList = await ProblemsApis.list({startDate,endDate});
        const goalsResult = await GoalApi.getMonthGoals({year:monthData.year,month: monthData.month});
        const goalList = goalsResult.length > 0 ? goalsResult[0].goals : [];
        return {monthData,problemList,goalList}
    } catch (e) {
        handleLoaderError(e);
    }
}

/**
 * 月统计表单。
 * @returns {JSX.Element} 月记录详情与编辑表单。
 */
const MonthForm = () => {
    const navigate = useNavigate();
    const {monthData,problemList : problems,goalList} = useLoaderData();
    const {monthId} = useParams();
    const [problemList,setProblemList] = useState(problems);
    const [goals, setGoals] = useState(goalList);
    const [formInstance] = Form.useForm();
    const messageApi = useContext(MessageContext);
    const {month,mark, summary,year, projectTime} = monthData;
    const countData = [];
    projectTime?.forEach(item => {
        countData.push({name: item.projectName, minutes: item.minutes})
    });
    projectTime.sort((a,b) => b.minutes - a.minutes);
    const {headButtons,editAble:isEdit} = useHeadMenus(formInstance,false,()=>{})

    const getMark = () => {
        if (isEdit) {
            return <Select
                style={{width: '140px'}}
                options={[
                    {
                        value: 1,
                        label: '不合格',
                    },
                    {
                        value: 2,
                        label: '合格',
                    },
                    {
                        value: 3,
                        label: '优秀',
                    },
                ]}
            />
        }
        return <MarkTag mark={mark}/>
    }

    const handleSubmit = (data) => {
        const {mark,summary} = data;
        MonthsApi.saveForm(monthId, {mark, summary}).then(()=>{
            messageApi.success('保存成功',5);
            window.setTimeout(()=>{
                window.location.reload();
            },1000)
        })
    }

    const getChartCondition = ()=>{
        const date = dayjs().year(monthData.year).month(monthData.month-1);
        return {
            dateRangeType: 3,
            startDate: date.startOf('month').format('YYYY-MM-DD'),
            endDate: date.endOf('month').format('YYYY-MM-DD')
        }
    }

    return (
        <Form
            className="month-statistics-form"
            name="basic"
            labelCol={{
                span: 4,
            }}
            form={formInstance}
            wrapperCol={{
                span: 8,
            }}
            autoComplete="off"
            onFinish={handleSubmit}
            method={'post'}
            initialValues={{mark,summary}}
        >
            <FormFrame
                buttons={headButtons}
                backEvent={() => navigate('/months')}
                hideBack={isEdit}
                title={
                    <Row gutter={24} align="middle" className="week-form-frame__fields">
                        <Col>
                            <div className="statistics-period-title">
                                <strong>{month}月</strong>
                                <span>{year}年</span>
                            </div>
                        </Col>
                        <Col>
                            <Form.Item label="评价" name="mark" labelAlign="left">
                                {getMark()}
                            </Form.Item>
                        </Col>
                    </Row>
                }
            >
                <FormTitle name="任务统计" variant="apple"/>
                <Row>
                    <ProjectCount data={countData}/>
                </Row>
                {projectTime.length > 0 && <Row>
                    <div style={{width: 500, height: 300}}>
                        <WorkTimePieChart
                            showCondition={false}
                            showLegend={false}
                            defaultCondition={getChartCondition()}
                        />
                    </div>
                </Row>}
                <FormTitle name="目标" variant="apple"/>
                <FullRow>
                    <GoalList
                        data={goals}
                        showTitle={false}
                        goalType="month"
                        month={monthData.month}
                        year={monthData.year}
                        onChange={(data) => setGoals(data)}
                    />
                </FullRow>
                <FormTitle name="问题" variant="apple"/>
                <Row>
                    <ProblemList data={problemList} onChange={(newData) => setProblemList(newData)}/>
                </Row>
                <FormTitle name="总结" variant="apple"/>
                <Row gutter={0}>
                    <SummaryTextArea editAble={isEdit} value={summary}/>
                </Row>
            </FormFrame>
        </Form>
    )
}

export default MonthForm;
