const assert = require("node:assert/strict");
const Module = require("node:module");
const test = require("node:test");
const esbuild = require(require.resolve("esbuild", {paths: [require.resolve("vite")]}));

async function loadCountWeekTasks() {
    const bundle = await esbuild.build({
        entryPoints: ["src/screens/statistics/weekTaskCount.js"],
        bundle: true,
        platform: "node",
        format: "cjs",
        packages: "external",
        write: false,
    });
    const source = new Module(`${process.cwd()}/weekTaskCount.test.bundle.cjs`, module);
    source.filename = `${process.cwd()}/weekTaskCount.test.bundle.cjs`;
    source.paths = module.paths;
    source._compile(bundle.outputFiles[0].text, source.filename);
    return source.exports.countWeekTasks;
}

test("周报任务统计优先归入日程项目，再归入清单项目，最后归入独立清单", async () => {
    const countWeekTasks = await loadCountWeekTasks();
    const time = {date: "2026-10-05", endDate: "2026-10-05", startTime: "09:00", endTime: "10:00"};
    const events = [
        {...time, projectId: 5, projectName: "日程项目", checklistId: 11, checklistName: "清单",
            checklistProjectId: 2, checklistProjectName: "清单项目"},
        {...time, projectId: 5, projectName: "日程项目"},
        {...time, checklistId: 12, checklistName: "关联清单",
            checklistProjectId: 2, checklistProjectName: "清单项目"},
        {...time, checklistId: 13, checklistName: "独立清单"},
    ];

    const result = countWeekTasks(events, "2026-10-05");

    assert.deepEqual(result, [
        {name: "日程项目", minutes: 120, isChecklist: false},
        {name: "清单项目", minutes: 60, isChecklist: false},
        {name: "独立清单", minutes: 60, isChecklist: true},
    ]);
});
