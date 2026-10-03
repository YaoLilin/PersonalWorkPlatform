const assert = require("node:assert/strict");
const Module = require("node:module");
const test = require("node:test");
const esbuild = require(require.resolve("esbuild", {paths: [require.resolve("vite")]}));

/** 加载前端模块，替换与颜色计算无关的图标依赖。 */
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
    const source = new Module(`${process.cwd()}/colorRules.test.bundle.cjs`, module);
    source.filename = `${process.cwd()}/colorRules.test.bundle.cjs`;
    source.paths = module.paths;
    source._compile(bundle.outputFiles[0].text, source.filename);
    return source.exports;
}

const projectTypes = [{key: 1, value: 1, color: "#112233", children: [
    {key: 2, value: 2, children: [{key: 3, value: 3, children: []}]},
    {key: 4, value: 4, color: "#445566", children: []}
]}];
const checklistTypes = [{key: 21, value: 21, color: "#778899", children: [
    {key: 22, value: 22, children: [{key: 23, value: 23, children: []}]}
]}];

test("类型颜色使用自身颜色，再逐级继承最近的上级颜色", async () => {
    const {getInheritedTypeColors} = await loadSource("src/util/typeColorUtils.js");
    const colors = getInheritedTypeColors([...projectTypes, {key: 5, children: []}]);
    assert.equal(colors[3], "#112233");
    assert.equal(colors[4], "#445566");
    assert.equal(colors[5], undefined);
    assert.equal(projectTypes[0].children[0].color, undefined);
});

test("清单类型树和分组卡片使用继承后的颜色", async () => {
    const {getChecklistGroups} = await loadSource("src/screens/checklist/checklistUtils.js");
    const groups = getChecklistGroups([{id: 31, checklistTypeId: 23}], checklistTypes, null);
    assert.equal(groups.find((group) => group.id === 23).color, "#778899");
    assert.equal(groups.find((group) => group.id === null).color, "#1677FF");
});

test("日程颜色按项目、项目类型、清单类型和默认色依次回退", async () => {
    const {getProjectColors, getChecklistTypeColors, toScheduleEvents} = await loadSource(
        "src/screens/schedule/utils/scheduleUtils.jsx"
    );
    const projects = [
        {id: 11, typeId: 3, customColor: "#aabbcc"},
        {id: 12, typeId: 3},
        {id: 13, typeId: 4},
        {id: 14, typeId: 99}
    ];
    const projectColors = getProjectColors(projectTypes, projects);
    const checklistColors = getChecklistTypeColors(checklistTypes, [
        {id: 31, checklistTypeId: 23}, {id: 32, checklistTypeId: 99}
    ]);
    const base = {date: "2026-10-03", endDate: "2026-10-03", startTime: "09:00", endTime: "10:00"};
    const colorOf = (item) => toScheduleEvents([{...base, ...item}], checklistColors, projectColors)[0].backgroundColor;
    assert.equal(colorOf({projectId: 11, checklistId: 31}), "#aabbcc");
    assert.equal(colorOf({projectId: 12, checklistId: 31}), "#112233");
    assert.equal(colorOf({projectId: 13, checklistId: 31}), "#445566");
    assert.equal(colorOf({projectId: 14, checklistId: 31}), "#778899");
    assert.equal(colorOf({checklistProjectId: 13, checklistId: 31}), "#445566");
    assert.equal(colorOf({checklistId: 31}), "#778899");
    assert.equal(colorOf({checklistId: 32}), "#1677FF");
});
