import {ProblemsApis} from "../../request/problemApi";
import {WeeksApi} from "../../request/weeksApi";
import {useContext} from "react";
import {MessageContext} from "../../provider/MessageProvider";

export default function useWeekFormSubmit(isFormCreate, tableData, theWeekProblems, projectTimeCount, weekIdFromParam) {
    const messageApi = useContext(MessageContext);
    async function fetchExistProblemNames(problems) {
        let existProblemNames = "";
        for (let i = 0; i < problems.length; i++) {
            const title = problems[i].title;
            if (title) {
                const result = await ProblemsApis.isExist(title);
                if (result) {
                    existProblemNames += title + "，";
                }
            }
        }
        if (existProblemNames) {
            existProblemNames = existProblemNames.substring(0, existProblemNames.length - 1);
        }
        return existProblemNames;
    }

    const verifyTableData = () => {
        for (let i = 0; i < tableData.length; i++) {
            const {date, project, startTime, endTime} = tableData[0];
            if (!date || project.value === -1 || !startTime || !endTime) {
                return false;
            }
        }
        return true;
    }

    const verifyProblemsIsExist = async (problems) => {
        let existProblemNames = await fetchExistProblemNames(problems);
        if (existProblemNames.length > 0) {
            messageApi.error("以下问题存在重复：" + existProblemNames, 5);
            return false;
        }
        return true;
    }

    const verifyProblems = async (weekDate) => {
        if (isFormCreate) {
            const weekIsExistsResult = await WeeksApi.weekExists(weekDate);
            if (weekIsExistsResult.result) {
                messageApi.error("已存在该周的记录，请前往对应的周记录进行修改", 5);
                return;
            }
            if (theWeekProblems.length > 0) {
                if (!await verifyProblemsIsExist(theWeekProblems)) {
                    return false;
                }
            }
        } else {
            const addProblems = theWeekProblems.filter(i => i.isEdit && i.title);
            if (addProblems.length > 0) {
                if (!await verifyProblemsIsExist(addProblems)) {
                    return false;
                }
            }
        }
        return true;
    }

    const getProjectUseTime = () => {
        // 获取每个项目的占用时间
        const items = [];
        let totalMinutes = 0;
        projectTimeCount.forEach(item => {
            totalMinutes += item.minutes;
            items.push({project: item.projectId, minutes: item.minutes});
        });
        return {items, totalMinutes};
    }

    const buildParams = (weekDate, mark, summary) => {
        const params = {};
        params.taskCount = getProjectUseTime();
        params.projectTimeList = tableData.map(item => {
            const newItem = {...item};
            newItem.project = item.project.value;
            return newItem;
        });
        params.date = weekDate;
        params.mark = Number(mark);
        params.summary = summary;
        if (isFormCreate) {
            const addProblemList = theWeekProblems.filter(i => i.title);
            addProblemList.forEach(i => i.weekDate = weekDate);
            params.problems = addProblemList;
        } else {
            params.addProblems = theWeekProblems.filter(i => i.isEdit && i.title);
        }
        return params;
    }

    return  async (data) => {
        const {week, mark, summary} = data;
        const weekDate = week.day(1).format('YYYY-MM-DD');
        if (!verifyTableData()) {
            messageApi.error("表格未填写完整", 5);
        }
        if (!await verifyProblems(weekDate)) {
            return;
        }
        const params = buildParams(weekDate, mark, summary);
        if (isFormCreate) {
            WeeksApi.createForm(params).then(result => {
                messageApi.success("提交成功", 5);
                window.setTimeout(() => {
                    window.location.replace('/weeks/form/' + result.id)
                }, 1000)
            }).catch(e =>{
                messageApi.error("提交失败", 5);
            });
        } else {
            WeeksApi.saveForm(weekIdFromParam, params).then(() => {
                messageApi.success("提交成功", 5);
                window.setTimeout(() => {
                    window.location.reload();
                }, 1000)
            }).catch(e =>{
                messageApi.error("提交失败", 5);
            });
        }
    }
}