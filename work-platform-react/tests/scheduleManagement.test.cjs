const assert = require('node:assert/strict');
const {test, afterEach} = require('node:test');
const Module = require('node:module');
const {JSDOM} = require('jsdom');
const dom = new JSDOM('<!doctype html><html><body></body></html>', {url: 'http://localhost'});
Object.assign(globalThis, {window: dom.window, document: dom.window.document});
Object.defineProperty(globalThis, "navigator", {configurable: true, value: dom.window.navigator});
const {renderHook, act, cleanup} = require('@testing-library/react');
const dayjs = require('dayjs');
const esbuild = require(require.resolve('esbuild', {paths: [require.resolve('vite')]}));
afterEach(cleanup);

/** 只替换网络边界，运行真实的管理、编辑器及事件集合 Hook。 */
async function loadManagement() {
    const bundle = await esbuild.build({
        entryPoints: ['src/screens/schedule/hooks/useScheduleManagement.js'],
        bundle: true, platform: 'node', format: 'cjs', packages: 'external', write: false,
        plugins: [{name: 'api-stubs', setup(build) {
            build.onResolve({filter: /request\/(scheduleApi|checklistApi)$/}, (args) => ({
                path: args.path.endsWith('scheduleApi') ? 'schedule' : 'checklist', namespace: 'stub',
            }));
            build.onLoad({filter: /.*/, namespace: 'stub'}, ({path}) => ({contents: path === 'schedule'
                ? 'module.exports = globalThis.scheduleTestApi;' : 'exports.ChecklistApi = globalThis.checklistTestApi;'}));
        }}],
    });
    const source = new Module(`${process.cwd()}/scheduleManagement.bundle.cjs`, module);
    source.filename = `${process.cwd()}/scheduleManagement.bundle.cjs`;
    source.paths = module.paths;
    source._compile(bundle.outputFiles[0].text, source.filename);
    return source.exports.useScheduleManagement;
}

/** 提供日历事件的公开操作，观察保存和失败恢复的外部行为。 */
function makeEvent() {
    return {
        id: '7', title: '项目清单', start: new Date('2026-10-13T09:00:00'), end: new Date('2026-10-13T10:00:00'),
        backgroundColor: '#112233', borderColor: '#112233', textColor: '#fff',
        extendedProps: {projectId: null, checklistId: 11, description: '', scheduleId: 7},
        setProp(name, value) {this[name] = value;}, setExtendedProp(name, value) {this.extendedProps[name] = value;},
        setStart(value) {this.start = value;}, setEnd(value) {this.end = value;}, remove() {this.removed = true;},
    };
}

async function setup(api) {
    globalThis.scheduleTestApi = api;
    globalThis.checklistTestApi = {updateChecklist: async () => {}};
    const useScheduleManagement = await loadManagement();
    const event = makeEvent();
    const errors = [];
    let changes = 0, creations = 0;
    const options = {
        initialEvents: [{...event}], projectOptions: [], checklists: [{id: 11, name: '项目清单'}],
        checklistTypeColors: {11: '#778899'}, projectColors: {2: '#112233'},
        calendarRef: {current: {getApi: () => ({getEventById: () => event})}},
        messageApi: {error: (message) => errors.push(message)},
        onChecklistChanged: () => changes++, onChecklistCreated: () => creations++,
    };
    const hook = renderHook(() => useScheduleManagement(options));
    const edit = async () => {
        act(() => hook.result.current.openEditor({event, el: {getBoundingClientRect: () => ({right: 100, left: 20, bottom: 100})}}));
        act(() => hook.result.current.setEventEditor((current) => ({...current,
            timeRange: [dayjs(event.start), dayjs(event.end).add(1, 'hour')]})));
        await act(() => hook.result.current.saveEditor());
    };
    return {hook, event, errors, edit, changes: () => changes, creations: () => creations};
}

test('只修改时间后保留清单项目和颜色，不依赖页面重新加载', async () => {
    let request;
    const subject = await setup({updateSchedule: async (id, params) => {
        request = {id, params};
        return {...params, id: 7, checklistName: '项目清单', checklistProjectId: 2, checklistProjectName: '项目B'};
    }});
    await subject.edit();
    const [saved] = subject.hook.result.current.scheduleEvents;
    assert.equal(request.id, 7);
    assert.equal(request.params.endTime, '11:00:00');
    assert.equal(saved.extendedProps.checklistProjectId, 2);
    assert.equal(saved.extendedProps.checklistProjectName, '项目B');
    assert.equal(saved.backgroundColor, '#112233');
    assert.equal(subject.changes(), 0);
    assert.equal(subject.hook.result.current.eventEditor, null);
});

test('保存失败恢复原时间、内容和颜色，并显示接口校验提示', async () => {
    const subject = await setup({updateSchedule: async () => {
        throw {response: {data: {message: '结束时间必须晚于开始时间'}}};
    }});
    await subject.edit();
    assert.equal(dayjs(subject.event.end).format('HH:mm'), '10:00');
    assert.equal(subject.event.title, '项目清单');
    assert.equal(subject.event.backgroundColor, '#112233');
    assert.deepEqual(subject.errors, ['结束时间必须晚于开始时间']);
    assert.equal(subject.changes(), 1);
});

test('删除失败保留日程，成功后关闭菜单并移除事件', async () => {
    let fail = true;
    const subject = await setup({deleteSchedule: async () => {if (fail) throw new Error('删除失败');}});
    const openMenu = () => act(() => subject.hook.result.current.openContextMenu({
        preventDefault() {}, clientX: 100, clientY: 100,
    }, subject.event));
    openMenu();
    await act(() => subject.hook.result.current.deleteEvent());
    assert.equal(subject.hook.result.current.scheduleEvents.length, 1);
    assert.equal(subject.event.removed, undefined);
    fail = false;
    openMenu();
    await act(() => subject.hook.result.current.deleteEvent());
    assert.equal(subject.hook.result.current.scheduleEvents.length, 0);
    assert.equal(subject.event.removed, true);
    assert.equal(subject.hook.result.current.contextMenu, null);
});

test('新建草稿仅在确认时创建日程并通知新增清单', async () => {
    let requests = 0;
    const subject = await setup({createSchedule: async (params) => {requests++; return {...params, id: 8, checklistId: 12};}});
    const open = () => act(() => subject.hook.result.current.openNewEditor({
        view: {type: 'timeGridWeek', calendar: {unselect() {}}},
        start: subject.event.start, end: subject.event.end, jsEvent: {clientX: 100, clientY: 100},
    }));
    open();
    await act(() => subject.hook.result.current.saveEditor());
    assert.equal(requests, 0);
    open();
    await act(() => subject.hook.result.current.saveEditor(true));
    assert.equal(requests, 1);
    assert.equal(subject.creations(), 1);
    assert.equal(subject.hook.result.current.scheduleEvents.length, 2);
});
