const {test}=require('node:test');const assert=require('assert/strict');
const dbPath=require.resolve('../common/db');let promotion,price=1590000;
require.cache[dbPath]={id:dbPath,filename:dbPath,loaded:true,exports:{promise:()=>({query:async(sql,args)=>{
 assert(sql.trim().startsWith('SELECT'),'Voucher preview must be read-only');
 return sql.includes('FROM goitapthoihan')?[[{GiaBan:price}]]:[promotion?[promotion]:[]];
}})}};
const preview=require('../controllers/package-voucher.controller');
const call=async(code='THU2026GYM10')=>{const res={statusCode:200,status(n){this.statusCode=n;return this},json(data){this.body=data;return this}};await preview({params:{GoiTapID:'33'},query:{durationId:'105',code}},res);return res;};
test('preview uses database coupons and matches existing registration discount rules',async()=>{
 promotion={MaKhuyenMai:'THU2026GYM10',PhanTramGiam:10,SoTienGiam:0};
 assert.equal((await call()).body.value,159000);
 price=5590000;assert.equal((await call()).body.value,559000);
 promotion={MaKhuyenMai:'FIXED',PhanTramGiam:10,SoTienGiam:9999999};assert.equal((await call('FIXED')).body.value,5590000);
 promotion=null;assert.equal((await call('INVALID')).statusCode,400);
 assert.equal((await call('')).statusCode,400);
});
