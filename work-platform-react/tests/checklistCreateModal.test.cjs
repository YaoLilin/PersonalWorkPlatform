const assert = require('node:assert/strict');
const {test} = require('node:test');
const Module = require('node:module');
const {JSDOM} = require('jsdom');
const dom = new JSDOM('<!doctype html><html><body></body></html>', {url: 'http://localhost'});
Object.assign(globalThis, {window: dom.window, document: dom.window.document});
Object.defineProperty(globalThis, "navigator", {configurable: true, value: dom.window.navigator});
for (const name of ['HTMLElement', 'Element', 'SVGElement', 'ShadowRoot']) globalThis[name] = dom.window[name];
const getStyle = dom.window.getComputedStyle.bind(dom.window);
globalThis.getComputedStyle = dom.window.getComputedStyle = (element) => getStyle(element);
dom.window.matchMedia = () => ({matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {}});
const React = require('react');
const {render, act, fireEvent, waitFor, cleanup} = require('@testing-library/react');
const esbuild = require(require.resolve('esbuild', {paths: [require.resolve('vite')]}));

/** 仅替换网络、项目浏览器和消息上下文，保留真实弹窗及 antd 表单。 */
async function loadModal() {
    const bundle = await esbuild.build({
        entryPoints: ['src/screens/checklist/ChecklistCreateModal.jsx'],
        bundle: true, platform: 'node', format: 'cjs', packages: 'external', write: false, jsx: 'automatic',
        plugins: [{name: 'boundaries', setup(build) {
            build.onResolve({filter: /(request\/(scheduleApi|checklistApi)|provider\/MessageProvider|public\/projectBrowser)$/},
                ({path}) => ({path, namespace: 'stub'}));
            build.onLoad({filter: /.*/, namespace: 'stub'}, ({path}) => ({contents:
                path.endsWith('scheduleApi') ? 'module.exports = globalThis.modalScheduleApi;'
                    : path.endsWith('checklistApi') ? 'exports.ChecklistApi = globalThis.modalChecklistApi;'
                        : path.endsWith('MessageProvider') ? 'exports.MessageContext = globalThis.modalMessageContext;'
                            : 'module.exports = () => null;',
            }));
        }}],
    });
    const source = new Module(`${process.cwd()}/checklistCreateModal.bundle.cjs`, module);
    source.filename = `${process.cwd()}/checklistCreateModal.bundle.cjs`;
    source.paths = module.paths;
    source._compile(bundle.outputFiles[0].text, source.filename);
    return source.exports.default;
}

test('新增弹窗独立初始化表单，保存失败可重试，成功通知列表并重置再次打开的表单', async () => {
    const errors = [], requests = [];
    let fail = true, created = 0;
    globalThis.modalMessageContext = React.createContext({error: (message) => errors.push(message), success() {}});
    globalThis.modalChecklistApi = {addChecklist: async (values) => {
        requests.push(values);
        if (fail) throw new Error('清单保存失败');
    }};
    globalThis.modalScheduleApi = {createSchedule: async () => {throw new Error('不应创建日程');}};
    const Modal = await loadModal();
    const ref = React.createRef();
    const screen = render(React.createElement(Modal, {ref, projects: [], typeTree: [], onCreated: () => created++}));
    try {
        act(() => ref.current.open(23));
        const nameInput = screen.getByLabelText('名称');
        fireEvent.change(nameInput, {target: {value: '新清单'}});
        fireEvent.click(screen.getByRole('button', {name: /保\s*存/}));
        await waitFor(() => assert.equal(errors.length, 1));
        assert.equal(created, 0);
        assert.equal(nameInput.value, '新清单');
        fail = false;
        fireEvent.click(screen.getByRole('button', {name: /保\s*存/}));
        await waitFor(() => assert.equal(created, 1));
        assert.equal(requests[1].checklistTypeId, 23);
        assert.equal(requests[1].name, '新清单');
        act(() => ref.current.open(undefined));
        assert.equal(screen.getByLabelText('名称').value, '');
    } finally {
        cleanup();
    }
});
