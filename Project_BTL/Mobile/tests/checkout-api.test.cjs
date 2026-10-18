const {test}=require('node:test');
const assert=require('assert/strict');
const fs=require('fs'),path=require('path'),vm=require('vm'),ts=require('typescript');
function client(status=200,body={DonHangID:12},invalidJson=false){
 const calls=[];let api;
 const context={exports:{},AbortController,setTimeout,clearTimeout,require:()=>({baseUrl:'http://test:3000',authenticatedFetch:async(url,init)=>{
  calls.push({url,init});return{status,ok:status<400,json:async()=>{if(invalidJson)throw new SyntaxError('Bad JSON');return body;}};
 }})};
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(__dirname,'../src/lib/shop-api.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,context);
 api=context.exports;
 const checkout={exports:{},require:()=>api};
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(__dirname,'../src/lib/checkout-api.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,checkout);
 return{...checkout.exports,...api,calls};
}
test('checkout uses authenticated shop URL and repeats the same request body',async()=>{
 const api=client();const body={requestKey:'same-persisted-request',cartVersion:'a'.repeat(64),name:'Member',phone:'0912345678',delivery:'PICKUP',address:'',note:'',paymentMethod:'TIEN_MAT'};
 await api.createShopOrder(7,body);await api.createShopOrder(7,body);
 assert.equal(api.calls[0].url,'http://test:3000/donhang/checkout/7');
 assert.equal(api.calls[0].init.method,'POST');
 assert.equal(api.calls[0].init.body,api.calls[1].init.body);
 await api.findCheckoutOrder(7,body.requestKey);
 assert.equal(api.calls[2].url,'http://test:3000/donhang/account/7/request/same-persisted-request');
});
test('HTTP errors preserve status for safe retries and display server messages',async()=>{
 for(const status of [400,401,403,409,500]){
  const api=client(status,{message:`Server message ${status}`});
  await assert.rejects(api.getCheckout(7),e=>e.status===status&&e.message===`Server message ${status}`);
 }
});
test('non-JSON success never masquerades as absent recovered order',async()=>{
 await assert.rejects(client(200,null,true).findCheckoutOrder(7,'saved-key'),/không hợp lệ/);
 assert.equal(await client(200,null).findCheckoutOrder(7,'saved-key'),null);
 await assert.rejects(client(500,null,true).getCheckout(7),e=>e.status===500);
});
test('resume opens newest pending order and excludes paid or cancelled orders',()=>{
 const {latestPendingOrder}=client();
 assert.equal(latestPendingOrder([]),null);
 assert.equal(latestPendingOrder([
  {DonHangID:10,TrangThai:'PENDING',TrangThaiThanhToan:'PENDING'},
  {DonHangID:12,TrangThai:'PENDING',TrangThaiThanhToan:'PENDING'},
  {DonHangID:14,TrangThai:'CANCELLED',TrangThaiThanhToan:'PENDING'},
  {DonHangID:15,TrangThai:'CONFIRMED',TrangThaiThanhToan:'SUCCESS'},
 ]),12);
 assert.equal(latestPendingOrder([{DonHangID:1,TrangThai:'PENDING',TrangThaiThanhToan:'SUCCESS'}]),null);
});
