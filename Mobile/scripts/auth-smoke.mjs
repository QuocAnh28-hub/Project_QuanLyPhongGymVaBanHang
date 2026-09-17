import assert from 'node:assert/strict';

const pages = await (await fetch('http://localhost:9223/json')).json();
const page = pages.find(p => p.type === 'page' && p.url.includes('8091'));
assert(page, 'Edge page not found');
const socket = new WebSocket(page.webSocketDebuggerUrl);
await new Promise(resolve => socket.addEventListener('open', resolve, { once: true }));
let id = 0;
const pending = new Map();
socket.addEventListener('message', ({ data }) => {
  const message = JSON.parse(data);
  if (message.id && pending.has(message.id)) { pending.get(message.id)(message); pending.delete(message.id); }
});
function send(method, params = {}) { const key = ++id; return new Promise(resolve => { pending.set(key, resolve); socket.send(JSON.stringify({ id: key, method, params })); }); }
async function evaluate(expression) { const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }); if (result.result?.exceptionDetails) throw Error(result.result.exceptionDetails.text); return result.result.result.value; }
async function waitFor(expression, label) { for (let i = 0; i < 80; i++) { if (await evaluate(expression)) return; await new Promise(r => setTimeout(r, 250)); } throw Error(`Timed out: ${label}`); }
async function click(text) { assert(await evaluate(`(() => { const e = [...document.querySelectorAll('*')].find(x => x.textContent?.trim() === ${JSON.stringify(text)} && x.closest('[tabindex],button,a')); if (!e) return false; e.closest('[tabindex],button,a').click(); return true; })()`), `Button ${text} not found`); }
async function fill(placeholder, value) { assert(await evaluate(`(() => { const e = document.querySelector('input[placeholder=${JSON.stringify(placeholder)}]'); if (!e) return false; const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set; setter.call(e,${JSON.stringify(value)}); e.dispatchEvent(new Event('input',{bubbles:true})); return true; })()`), `Input ${placeholder} not found`); }
await send('Page.enable');
await evaluate(`localStorage.removeItem('qa-gym-dev-session')`);
await evaluate(`localStorage.removeItem('qa-gym-dev-accounts')`);
await send('Page.reload');
await waitFor(`document.body.innerText.includes('Chào mừng trở lại')`, 'cold start login');
await waitFor(`[...document.images].some(i => i.src.includes('gym-hero') && i.complete && i.naturalWidth > 0)`, 'local hero image');
console.log('cold start: login');
await fill('vd: 0988xxxxxx hoặc email@gym.vn', 'admin@qagym.vn');
await fill('••••••••', '12345678');
await click('ĐĂNG NHẬP NGAY');
await waitFor(`document.body.innerText.includes('Sẵn sàng bứt phá?')`, 'login to home');
console.log('login: home');
await send('Page.reload');
await waitFor(`document.body.innerText.includes('Sẵn sàng bứt phá?')`, 'persisted home');
console.log('reload: home');
await send('Page.navigate', { url: 'http://localhost:8091/login' });
await waitFor(`document.body.innerText.includes('Sẵn sàng bứt phá?')`, 'authenticated login redirect');
console.log('authenticated auth route: home');
await send('Page.navigate', { url: 'http://localhost:8091/profile' });
await waitFor(`document.body.innerText.includes('Đăng xuất tài khoản')`, 'profile');
await click('Đăng xuất tài khoản');
await waitFor(`document.body.innerText.includes('Chào mừng trở lại')`, 'logout login');
await evaluate(`history.back()`);
await waitFor(`document.body.innerText.includes('Chào mừng trở lại')`, 'back after logout');
assert(await evaluate(`document.body.innerText.includes('Chào mừng trở lại')`), 'Back reopened protected app');
console.log('logout + back: login');
await send('Page.navigate', { url: 'http://localhost:8091/packages' });
await waitFor(`document.body.innerText.includes('Chào mừng trở lại')`, 'protected deep link');
console.log('protected route: login');
await click('Đăng ký ngay');
await waitFor(`document.body.innerText.includes('Gia nhập')`, 'register');
await click('Đăng nhập');
await waitFor(`document.body.innerText.includes('Chào mừng trở lại')`, 'register to login');
console.log('register round trip: login');
await click('Đăng ký ngay');
const email = `smoke${Date.now()}@qagym.vn`;
await fill('Nguyễn Tuấn Anh', 'Test Member');
await fill('0912 345 678', '0912345678');
await fill('email@example.com', email);
await fill('Ít nhất 8 ký tự, gồm chữ và số', 'test12345');
await fill('Nhập lại mật khẩu', 'test12345');
assert(await evaluate(`(() => { const e=[...document.querySelectorAll('[tabindex]')].find(x=>x.textContent?.includes('Tôi đồng ý')); if(!e)return false;e.click();return true;})()`));
await click('ĐĂNG KÝ HỘI VIÊN');
await waitFor(`document.body.innerText.includes('Sẵn sàng bứt phá?')`, 'register to home');
console.log('register: home');
await send('Page.navigate', { url: 'http://localhost:8091/profile' });
await waitFor(`document.body.innerText.includes('Đăng xuất tài khoản')`, 'profile after register');
await click('Đăng xuất tài khoản');
await waitFor(`document.body.innerText.includes('Chào mừng trở lại')`, 'login after register logout');
await click('Quên mật khẩu?');
await waitFor(`document.body.innerText.includes('Khôi phục mật khẩu')`, 'forgot');
await click('QUAY LẠI ĐĂNG NHẬP');
await waitFor(`document.body.innerText.includes('Chào mừng trở lại')`, 'forgot to login');
console.log('forgot round trip: login');
await click('Quên mật khẩu?');
await fill('09xx xxx 678', '0912345678');
await click('GỬI MÃ XÁC THỰC');
await waitFor(`document.body.innerText.includes('Mã thử nghiệm: 123456')`, 'verify OTP');
await fill('6 chữ số', '123456');
await click('XÁC THỰC');
await waitFor(`document.body.innerText.includes('Đặt lại mật khẩu')`, 'reset password');
await fill('Ít nhất 8 ký tự', '87654321');
await fill('Nhập lại mật khẩu mới', '87654321');
await click('LƯU MẬT KHẨU');
await waitFor(`document.body.innerText.includes('Chào mừng trở lại')`, 'reset to login');
console.log('OTP + reset: login');
socket.close();
