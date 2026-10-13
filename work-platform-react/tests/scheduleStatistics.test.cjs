const assert = require("node:assert/strict");
const Module = require("node:module");
const test = require("node:test");
const esbuild = require(require.resolve("esbuild", {paths: [require.resolve("vite")]}));

/** 加载前端模块，替换与日程统计无关的图标依赖。 */
async function loadSource(path) {
    const bundle = await esbuild.build({
        entryPoints: [path],
        bundle: true,
        platform: "node",
        format: "cjs",
        packages: "external",
        write: false,
        plugins: [{
            name: "mock-icons",
            setup(build) {
                build.onResolve({filter: /^@ant-design\/icons$/}, () => ({path: "icons", namespace: "mock"}));
                build.onLoad({filter: /.*/, namespace: "mock"}, () => ({
                    contents: "exports.FolderOutlined = () => null;", loader: "js"
                }));
            }
        }]
    });
    const source = new Module(`${process.cwd()}/scheduleStatistics.test.bundle.cjs`, module);
    source.filename = `${process.cwd()}/scheduleStatistics.test.bundle.cjs`;
    source.paths = module.paths;
    source._compile(bundle.outputFiles[0].text, source.filename);
    return source.exports;
}

const sourcePath = "src/screens/schedule/utils/scheduleUtils.jsx";
const dayjs = require("dayjs");
const range = {start: dayjs("2026-10-12"), end: dayjs("2026-10-19")};
const time = {date: "2026-10-13", startTime: "09:00", endTime: "10:00"};

test("同一项目的不同清单和直接关联日程合并，日程项目优先于清单项目", async () => {
    const {toScheduleEvents, getProjectTimeStatistics, toScheduleParam} = await loadSource(sourcePath);
    const events = toScheduleEvents([
        {...time, id: 1, projectId: 5, projectName: "项目A", checklistId: 11, checklistName: "清单一",
            checklistProjectId: 2, checklistProjectName: "项目B"},
        {...time, id: 2, projectId: 5, projectName: "项目A", checklistId: 12, checklistName: "清单二"},
        {...time, id: 3, projectId: 5, projectName: "项目A", scheduleName: "独立日程"},
        {...time, id: 4, projectId: null, checklistId: 13, checklistName: "关联清单",
            checklistProjectId: 2, checklistProjectName: "项目B"},
        {...time, id: 5, projectId: 2, projectName: "项目B"},
    ], {}, {5: "#112233", 2: "#445566"});
    assert.deepEqual(getProjectTimeStatistics(events, range), [
        {name: "项目A", value: 3, itemStyle: {color: "#112233"}},
        {name: "项目B", value: 2, itemStyle: {color: "#445566"}},
    ]);
    assert.equal(toScheduleParam(events[3]).projectId, null);
});

test("无项目日程按清单或名称分组，同名不同项目分别统计", async () => {
    const {toScheduleEvents, getProjectTimeStatistics} = await loadSource(sourcePath);
    const events = toScheduleEvents([
        {...time, id: 1, projectId: null, checklistId: 11, checklistName: "清单"},
        {...time, id: 2, checklistId: 11, checklistName: "清单"},
        {...time, id: 3, projectId: null, scheduleName: "无项目日程"},
        {...time, id: 4, projectId: 5, projectName: "同名项目"},
        {...time, id: 5, projectId: 6, projectName: "同名项目"},
    ]);
    assert.deepEqual(getProjectTimeStatistics(events, range).map(({name, value}) => ({name, value})), [
        {name: "清单", value: 2}, {name: "无项目日程", value: 1},
        {name: "同名项目", value: 1}, {name: "同名项目", value: 1},
    ]);
});

test("项目时长仅累计视图内的部分，忽略范围外和无效时间", async () => {
    const {toScheduleEvents, getProjectTimeStatistics} = await loadSource(sourcePath);
    const project = {projectId: 5, projectName: "项目A"};
    const events = toScheduleEvents([
        {...project, id: 1, date: "2026-10-11", endDate: "2026-10-12", startTime: "23:00", endTime: "01:00"},
        {...project, id: 2, date: "2026-10-18", endDate: "2026-10-19", startTime: "23:00", endTime: "01:00"},
        {...project, id: 3, date: "2026-10-19", startTime: "00:00", endTime: "01:00"},
        {...project, id: 4, date: "2026-10-11", startTime: "22:00", endTime: "23:00"},
        {...project, id: 5, ...time, startTime: "10:00", endTime: "09:00"},
    ]);
    events.push({start: "invalid", end: "invalid", extendedProps: project});
    assert.deepEqual(getProjectTimeStatistics(events, range).map(({name, value}) => ({name, value})), [
        {name: "项目A", value: 2},
    ]);
});
