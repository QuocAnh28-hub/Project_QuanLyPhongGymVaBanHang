import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const pages = await (await fetch('http://127.0.0.1:9223/json')).json();
const page = pages.find(p => p.type === 'page' && p.url.includes('8091'));
assert(page, 'Edge package test page not found');
const socket = new WebSocket(page.webSocketDebuggerUrl);
await new Promise(resolve => socket.addEventListener('open', resolve, { once: true }));
let id = 0;
const pending = new Map();
socket.addEventListener('message', ({ data }) => { const result = JSON.parse(data); if (pending.has(result.id)) { pending.get(result.id)(result); pending.delete(result.id); } });
function send(method, params = {}) { const key = ++id; return new Promise(resolve => { pending.set(key, resolve); socket.send(JSON.stringify({ id: key, method, params })); }); }
async function evaluate(expression) { const data = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }); if (data.result?.exceptionDetails) throw Error(data.result.exceptionDetails.text); return data.result.result.value; }
async function waitFor(expression, label) { for (let i = 0; i < 80; i++) { if (await evaluate(expression)) return; await new Promise(resolve => setTimeout(resolve, 250)); } throw Error(`Timed out: ${label}`); }
async function click(text) { assert(await evaluate(`(() => { const e=[...document.querySelectorAll('*')].findLast(x=>x.textContent?.trim()===${JSON.stringify(text)} && x.closest('[tabindex],button,a'));if(!e)return false;e.closest('[tabindex],button,a').click();return true;})()`), `Missing action: ${text}`); }
async function fill(placeholder, value) { assert(await evaluate(`(() => { const e=document.querySelector('input[placeholder=${JSON.stringify(placeholder)}]');if(!e)return false;const set=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;set.call(e,${JSON.stringify(value)});e.dispatchEvent(new Event('input',{bubbles:true}));return true;})()`), `Missing input: ${placeholder}`); }
await send('Page.enable');
await evaluate(`localStorage.removeItem('qa-gym-dev-session')`);
await evaluate(`localStorage.removeItem('qa-gym-memberships')`);
await evaluate(`localStorage.removeItem('qa-gym-package-favorites')`);
await send('Page.navigate', { url: 'http://127.0.0.1:8091/login' });
await waitFor(`document.body.innerText.includes('Chào mừng trở lại')`, 'login');
await fill('vd: 0988xxxxxx hoặc email@gym.vn', 'admin@qagym.vn');
await fill('••••••••', '12345678');
await click('ĐĂNG NHẬP NGAY');
await waitFor(`document.body.innerText.includes('Sẵn sàng bứt phá?')`, 'home');
await send('Page.navigate', { url: 'http://127.0.0.1:8091/packages' });
await waitFor(`document.body.innerText.includes('XEM CHI TIẾT DIAMOND')`, 'packages');
await click('XEM CHI TIẾT DIAMOND');
await waitFor(`document.body.innerText.includes('EXERCISE DETAIL')`, 'detail');
if (process.env.CAPTURE_PACKAGE) {
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  await new Promise(resolve => setTimeout(resolve, 400));
  const shot = await send('Page.captureScreenshot', { format: 'png' });
  writeFileSync(join(tmpdir(), 'qa-package-detail.png'), Buffer.from(shot.result.data, 'base64'));
}
await waitFor(`['diamond-club','bodypump','rpm-cycling','power-yoga','boxing-kickfit','zumba-neon','quoc-nam','thao-my'].every(name => [...document.images].some(i => i.src.includes(name) && i.complete && i.naturalWidth > 0))`, 'all eight local images');
for (const width of [360, 375, 390, 412, 430]) {
  await send('Emulation.setDeviceMetricsOverride', { width, height: 844, deviceScaleFactor: 1, mobile: true });
  assert(await evaluate(`document.documentElement.scrollWidth <= innerWidth + 1`), `Horizontal overflow at ${width}px`);
}
assert(await evaluate(`document.body.innerText.includes('15.480.000₫') && document.body.innerText.includes('1.290.000₫')`));
await click('3 Tháng');
await waitFor(`document.body.innerText.includes('4.770.000₫') && document.body.innerText.includes('1.590.000₫') && document.body.innerText.includes('Gói thanh toán 3 tháng')`, '3 months');
await click('6 Tháng');
await waitFor(`document.body.innerText.includes('8.520.000₫') && document.body.innerText.includes('1.420.000₫') && document.body.innerText.includes('Gói thanh toán 6 tháng')`, '6 months');
await click('ĐĂNG KÝ NGAY');
await waitFor(`document.body.innerText.includes('THÔNG TIN GÓI') && document.body.innerText.includes('8.520.000₫')`, 'six month confirmation');
await click('HỦY');
assert.equal(await evaluate(`localStorage.getItem('qa-gym-memberships')`), null);
await click('12 Tháng');
await waitFor(`document.body.innerText.includes('15.480.000₫') && document.body.innerText.includes('Gói 12 tháng + 2 tháng tặng')`, '12 months');
await click('BodyPump™');
await waitFor(`document.body.innerText.includes('Năng lượng')`, 'class detail');
await click('ĐÓNG');
assert(await evaluate(`(() => { const e=document.querySelector('[aria-label="Chia sẻ"]');if(!e)return false;e.click();return true;})()`));
await waitFor(`document.body.innerText.includes('EXERCISE DETAIL')`, 'share returns to detail');
assert(await evaluate(`(() => { const e=document.querySelector('[aria-label="Yêu thích"]');if(!e)return false;e.click();return true;})()`));
await waitFor(`localStorage.getItem('qa-gym-package-favorites')?.includes('diamond-all-access')`, 'favorite on');
await send('Page.reload');
await waitFor(`(() => { const e=document.querySelector('[aria-label="Yêu thích"]')?.firstElementChild; return e && getComputedStyle(e).color === 'rgb(195, 244, 0)'; })()`, 'favorite persisted');
await evaluate(`document.querySelector('[aria-label="Yêu thích"]').click()`);
await waitFor(`localStorage.getItem('qa-gym-package-favorites')==='[]'`, 'favorite off');
await click('ĐĂNG KÝ NGAY');
await waitFor(`document.body.innerText.includes('THÔNG TIN GÓI') && document.body.innerText.includes('14 tháng')`, 'confirmation');
assert(await evaluate(`(() => { const e=[...document.querySelectorAll('*')].findLast(x=>x.textContent?.trim()==='XÁC NHẬN ĐĂNG KÝ' && x.closest('[tabindex]'))?.closest('[tabindex]');if(!e)return false;e.click();e.click();return true;})()`));
await waitFor(`document.body.innerText.includes('Đăng ký đã được tạo')`, 'pending enrollment');
const rows = await evaluate(`JSON.parse(localStorage.getItem('qa-gym-memberships'))`);
assert.equal(rows.length, 1);
assert.equal(rows[0].status, 'pending_payment');
assert.equal(rows[0].durationMonths, 12);
assert.equal(rows[0].bonusMonths, 2);
assert.equal(rows[0].totalPrice, 15480000);
await click('ĐÓNG');
await evaluate(`document.querySelector('[aria-label="Quay lại Gói tập"]').click()`);
await waitFor(`document.body.innerText.includes('XEM CHI TIẾT DIAMOND')`, 'back to packages');
await send('Page.navigate', { url: 'http://127.0.0.1:8091/package-detail?id=missing' });
await waitFor(`document.body.innerText.includes('Không tìm thấy gói tập')`, 'unknown package');
await send('Page.navigate', { url: 'http://127.0.0.1:8091/profile' });
await waitFor(`document.body.innerText.includes('CHỜ THANH TOÁN')`, 'profile pending');
console.log('Package detail, images, durations, favorite, enrollment, profile, and back passed');
socket.close();
