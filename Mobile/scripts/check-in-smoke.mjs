import assert from 'node:assert/strict';

const pages = await (await fetch('http://127.0.0.1:9223/json')).json();
const page = pages.find(item => item.type === 'page' && item.url.includes('8091'));
assert(page, 'Edge page not found');
const socket = new WebSocket(page.webSocketDebuggerUrl);
await new Promise(resolve => socket.addEventListener('open', resolve, { once: true }));
let id = 0; const pending = new Map();
socket.addEventListener('message', ({ data }) => { const result = JSON.parse(data); if (pending.has(result.id)) { pending.get(result.id)(result); pending.delete(result.id); } });
function send(method, params = {}) { const key = ++id; return new Promise(resolve => { pending.set(key, resolve); socket.send(JSON.stringify({ id: key, method, params })); }); }
async function evaluate(expression) { const data = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }); if (data.result?.exceptionDetails) throw Error(data.result.exceptionDetails.text); return data.result.result.value; }
async function waitFor(expression, label, attempts = 120) { for (let i = 0; i < attempts; i++) { if (await evaluate(expression)) return; await new Promise(resolve => setTimeout(resolve, 250)); } throw Error(`Timed out: ${label}`); }
async function click(text) { assert(await evaluate(`(() => { const e=[...document.querySelectorAll('*')].findLast(x=>x.textContent?.trim()===${JSON.stringify(text)} && x.closest('[tabindex],button,a'));if(!e)return false;e.closest('[tabindex],button,a').click();return true;})()`), `Missing action: ${text}`); }
const now = new Date(); const yesterday = new Date(now.getTime() - 86400000); const previous = new Date(now); previous.setMonth(previous.getMonth() - 1);
const date = value => value.toISOString().slice(0, 10);
const membership = { id: 'QA-MEM-SMOKE', userId: 'admin@qagym.vn', packageId: 'diamond-all-access', packageName: 'Diamond All-Access Pass', durationMonths: 12, bonusMonths: 2, accessDurationMonths: 14, memberName: 'stale name', phone: '0988123678', email: 'admin@qagym.vn', activationDate: date(new Date(now.getTime() - 30 * 86400000)), expiryDate: date(new Date(now.getTime() + 300 * 86400000)), homeClubId: 'q1-vincom', baseAmount: 1, membershipDiscount: 0, voucherCode: null, voucherDiscount: 0, fees: 0, finalAmount: 1, paymentMethod: 'pos', status: 'active', createdAt: now.toISOString(), termsAcceptedAt: now.toISOString(), gifts: [], monthlyPrice: 1, totalPrice: 1, startDate: date(now) };
const records = [
  { id: 'current-1', userId: 'admin@qagym.vn', membershipId: membership.id, clubId: 'q1-vincom', clubName: 'QA-Gym Vincom Đồng Khởi', area: 'Cardio', checkInAt: yesterday.toISOString(), checkOutAt: new Date(yesterday.getTime() + 3600000).toISOString(), status: 'completed' },
  { id: 'current-2', userId: 'admin@qagym.vn', membershipId: membership.id, clubId: 'q7-platinum', clubName: 'QA-Gym Platinum Quận 7', area: 'Strength', checkInAt: now.toISOString(), status: 'in_progress' },
  { id: 'previous', userId: 'admin@qagym.vn', membershipId: membership.id, clubId: 'q1-vincom', clubName: 'QA-Gym Vincom Đồng Khởi', area: 'Yoga', checkInAt: previous.toISOString(), checkOutAt: new Date(previous.getTime() + 1800000).toISOString(), status: 'completed' },
  { id: 'other-user', userId: 'other@qagym.vn', membershipId: 'other', clubId: 'q1-vincom', clubName: 'KHÔNG ĐƯỢC HIỆN', area: 'Private', checkInAt: now.toISOString(), status: 'in_progress' },
];
await send('Page.enable');
await evaluate(`localStorage.setItem('qa-gym-dev-session','admin@qagym.vn');localStorage.removeItem('qa-gym-memberships');localStorage.setItem('qa-gym-check-ins',${JSON.stringify(JSON.stringify(records))})`);
await send('Page.navigate', { url: 'http://localhost:8091/profile' });
await waitFor(`document.body.innerText.includes('MÃ QR VÀO CỬA')`, 'profile');
await click('▧ MÃ QR VÀO CỬA');
await waitFor(`document.body.innerText.includes('Bạn chưa có gói tập đang hoạt động')`, 'inactive QR lock');
await evaluate(`localStorage.setItem('qa-gym-memberships',${JSON.stringify(JSON.stringify([membership]))})`);
await send('Page.navigate', { url: 'http://localhost:8091/profile' });
await waitFor(`document.body.innerText.includes('QA-SMOKE')`, 'active card');
await click('▧ MÃ QR VÀO CỬA'); await waitFor(`document.body.innerText.includes('CỔNG KIỂM SOÁT QR')`, 'QR from profile'); await evaluate(`history.back()`); await waitFor(`document.body.innerText.includes('THẺ THÀNH VIÊN HIỆN HÀNH')`, 'QR back to profile');
await click('CHI TIẾT THẺ'); await waitFor(`document.body.innerText.includes('GÓI TẬP ĐANG DÙNG') && document.body.innerText.includes('NGUYỄN TUẤN ANH')`, 'membership detail');
await click('MÃ CHECK-IN QR'); await waitFor(`document.body.innerText.includes('CỔNG KIỂM SOÁT QR') && document.body.innerText.includes('MÃ TOKEN OFFLINE ĐỘNG')`, 'QR from detail');
const before = await evaluate(`document.body.innerText.match(/LÀM MỚI BẢO MẬT: ([0-9]+)s/)?.[1]`); await new Promise(resolve => setTimeout(resolve, 1500)); const after = await evaluate(`document.body.innerText.match(/LÀM MỚI BẢO MẬT: ([0-9]+)s/)?.[1]`); assert.notEqual(before, after, 'QR countdown did not advance');
const oldToken = await evaluate(`document.querySelector('[aria-label^="QR token "]')?.getAttribute('aria-label')`); await new Promise(resolve => setTimeout(resolve, 45000)); const newToken = await evaluate(`document.querySelector('[aria-label^="QR token "]')?.getAttribute('aria-label')`); assert(oldToken && newToken && oldToken !== newToken, 'QR token did not refresh');
await evaluate(`history.back()`); await waitFor(`document.body.innerText.includes('GÓI TẬP ĐANG DÙNG')`, 'QR back to detail');
await evaluate(`history.forward()`); await waitFor(`document.body.innerText.includes('CỔNG KIỂM SOÁT QR')`, 'forward QR');
await click('LỊCH SỬ VÀO CỔNG'); await waitFor(`document.body.innerText.includes('LỊCH SỬ CHECK-IN') && document.body.innerText.includes('2 BUỔI TẬP') && !document.body.innerText.includes('KHÔNG ĐƯỢC HIỆN')`, 'filtered current-user history');
await click('QA-Gym Platinum Quận 7'); await waitFor(`document.body.innerText.includes('1 LẦN CHECK-IN')`, 'club filter');
await click('Tháng trước'); await waitFor(`document.body.innerText.includes('Chưa có lịch sử check-in')`, 'month and club filter');
await evaluate(`history.back()`); await waitFor(`document.body.innerText.includes('CỔNG KIỂM SOÁT QR')`, 'history back to QR');
for (const width of [360, 375, 390, 412, 430]) { await send('Emulation.setDeviceMetricsOverride', { width, height: 844, deviceScaleFactor: 1, mobile: true }); for (const route of ['check-in-pass', 'check-in-history', 'membership-detail']) { await send('Page.navigate', { url: `http://localhost:8091/${route}` }); await waitFor(`document.body.innerText.length > 50`, `${route} ${width}`); assert.equal(await evaluate(`document.documentElement.scrollWidth <= ${width}`), true, `${route} overflows at ${width}px`); } }
console.log('Check-in profile/detail/QR/history/back/countdown/current-user/monthly-summary/filters passed');
socket.close();
