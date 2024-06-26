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
import TimeCountChart from "../../components/statistics/form/TimeCountChart";
import dayjs from "dayjs";
import {MessageContext} from "../../provider/MessageProvider";
import useHeadMenus from "./useHeadMenus";
import SummaryTextArea from "../../components/statistics/form/SummaryTextArea";

export async function loader({params}) {
    const monthData =await MonthsApi.getMonth(params.monthId);
    const startDate = monthData.year +'-'+monthData.month+'-01';
    const endDate = dayjs(startDate).endOf("month").format("YYYY-MM-DD");
    const problemList =await ProblemsApis.list({startDate,endDate});
    return {monthData,problemList}
}

const MonthForm = () => {
    const navigate = useNavigate();
    const {monthData,problemList : problems} = useLoaderData();
    const {monthId} = useParams();
    const [problemList,setProblemList] = useState(problems);
    const [formInstance] = Form.useForm();
    const messageApi = useContext(MessageContext);
    // projectTime item :{projectName:text,minutes:number}
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

    return (
        <Form
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
            <FormFrame buttons={headButtons} backEvent={() => navigate('/months')}>
                <div style={{maxWidth: '1000px', margin: '0 auto'}}>
                    <Row gutter={0} justify="start">
                        <Col span={12}>
                            <>
                                <span style={{fontSize: '2em'}}>{month}月</span>
                                <span style={{paddingLeft: '10px'}}>{year}年</span>
                            </>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="评价"
                                name="mark"
                                labelAlign={'left'}
                            >
                                {getMark()}
                            </Form.Item>
                        </Col>
                    </Row>
                    <FormTitle name='任务统计'/>
                    <Row>
                        <ProjectCount data={countData}/>
                    </Row>
                    {
                        projectTime.length > 0 &&
                        <Row>
                            <TimeCountChart projectTime={projectTime} monthId={monthId}/>
                        </Row>
                    }
                    <FormTitle name='问题'/>
                    <Row>
                        <ProblemList data={problemList} onChange={(newData) => setProblemList(newData)}/>
                    </Row>
                    <FormTitle name='总结'/>
                    <Row gutter={0}>
                        <SummaryTextArea editAble={isEdit} value={summary}/>
                    </Row>
                </div>
            </FormFrame>
        </Form>
    )
}

export default MonthForm;