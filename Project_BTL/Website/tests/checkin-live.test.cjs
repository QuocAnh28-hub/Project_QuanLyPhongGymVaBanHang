const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const ts = require('typescript');

// Run the actual component's handlers with mocked hooks/API, without a browser or DB.
function screen() {
  const cells = [];
  let cursor = 0, refreshes = 0, failRefresh = false;
  const checkedOut = [];
  const rows = [7, 9].map(CheckInID => ({ CheckInID, HoiVienID: 8, HoTen: 'Test Member',
    SoDienThoai: '0912345678', AnhDaiDien: '/uploads/members/avatar.png', ThoiGianDaTap: 3600,
    ThoiGianCheckIn: '2026-10-07 10:00:00', ThoiGianCheckOut: null, TrangThai: 'CHECKED_IN' }));
  const jsx = (_type, props) => ({ type: _type, props });
  const context = { exports: {}, Date, Blob, URL, window: { setInterval() {}, clearInterval() {} },
    require(name) {
      if (name === 'react') return {
        useState(initial) {
          const index = cursor++;
          if (!(index in cells)) cells[index] = initial;
          return [cells[index], value => { cells[index] = typeof value === 'function' ? value(cells[index]) : value; }];
        },
        useRef(initial) {
          const index = cursor++;
          if (!(index in cells)) cells[index] = { current: initial };
          return cells[index];
        },
        useEffect() {}, useMemo: fn => fn(), createElement: jsx,
      };
      if (name === 'react/jsx-runtime') return { jsx, jsxs: jsx };
      if (name.endsWith('/AdminLayout')) return { MetricCard: 'MetricCard', Modal: 'Modal' };
      if (name.endsWith('/images')) return { resolveBackendImageUrl: value => value && `http://backend:3000${value}` };
      if (name.endsWith('/checkins')) return {
        async getTodayCheckIns() {
          refreshes++;
          if (failRefresh) throw new Error('Refresh unavailable');
          return { rows: structuredClone(rows), metrics: { total: 2,
            present: rows.filter(row => row.TrangThai === 'CHECKED_IN').length,
            checkedOut: rows.filter(row => row.TrangThai === 'CHECKED_OUT').length } };
        },
        async checkout(id) {
          checkedOut.push(id);
          const row = rows.find(row => row.CheckInID === id);
          row.TrangThai = 'CHECKED_OUT'; row.ThoiGianCheckOut = '2026-10-07 11:00:00';
          return { message: 'Check-out thành công', data: { ...row } };
        },
      };
      throw new Error(name);
    },
  };
  const code = ts.transpileModule(fs.readFileSync(path.join(__dirname, '../src/pages/CheckInLivePage.tsx'), 'utf8'), {
    fileName: 'CheckInLivePage.tsx', compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  vm.runInNewContext(code, context);
  return { render() { cursor = 0; return context.exports.default(); }, checkedOut,
    get refreshes() { return refreshes; }, failRefresh() { failRefresh = true; } };
}
function nodes(tree) {
  if (!tree || typeof tree !== 'object') return [];
  if (Array.isArray(tree)) return tree.flatMap(nodes);
  return [tree, ...nodes(tree.props?.children)];
}
const button = (tree, text) => nodes(tree).find(node => node.type === 'button' && node.props.children === text);
const flush = () => new Promise(resolve => setImmediate(resolve));

test('Web renders checkout, confirms the selected session ID, refreshes metrics and filters', async () => {
  const page = screen();
  button(page.render(), '↻ LÀM MỚI').props.onClick();
  await flush();
  let tree = page.render();
  const actions = nodes(tree).filter(node => node.type === 'button' && node.props.children === 'CHECK-OUT');
  assert.equal(actions.length, 2);
  actions[1].props.onClick(); // Same HoiVienID, but CheckInID 9 rather than 7.
  tree = page.render();
  assert.ok(nodes(tree).some(node => node.type === 'Modal'));
  assert.equal(nodes(tree).find(node => node.type === 'img').props.src, 'http://backend:3000/uploads/members/avatar.png');
  assert.ok(button(tree, 'HỦY'));
  button(tree, 'XÁC NHẬN CHECK-OUT').props.onClick();
  await flush();
  assert.deepEqual(page.checkedOut, [9]);
  assert.equal(page.refreshes, 2);
  tree = page.render();
  assert.equal(nodes(tree).some(node => node.type === 'Modal'), false);
  assert.equal(nodes(tree).filter(node => node.type === 'button' && node.props.children === 'CHECK-OUT').length, 1);
  assert.equal(nodes(tree).find(node => node.props?.label === 'ĐANG CÓ MẶT').props.value, '1');
  assert.equal(nodes(tree).find(node => node.props?.label === 'ĐÃ CHECK-OUT').props.value, '1');
  button(tree, 'Đang có mặt').props.onClick();
  tree = page.render();
  assert.equal(nodes(tree).filter(node => node.type === 'article').length, 1);
});

test('successful checkout updates Web immediately even if refresh fails', async () => {
  const page = screen();
  button(page.render(), '↻ LÀM MỚI').props.onClick();
  await flush();
  button(page.render(), 'CHECK-OUT').props.onClick();
  page.failRefresh();
  button(page.render(), 'XÁC NHẬN CHECK-OUT').props.onClick();
  await flush();
  const tree = page.render();
  assert.equal(nodes(tree).find(node => node.props?.label === 'ĐANG CÓ MẶT').props.value, '1');
  assert.equal(nodes(tree).find(node => node.props?.label === 'ĐÃ CHECK-OUT').props.value, '1');
  assert.equal(nodes(tree).some(node => node.type === 'Modal'), false);
});
