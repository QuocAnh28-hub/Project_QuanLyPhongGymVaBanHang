const {test}=require('node:test');const assert=require('assert/strict');
let saved;
const modelPath=require.resolve('../models/khuyenmai.model');
require.cache[modelPath]={id:modelPath,filename:modelPath,loaded:true,exports:{insert:(data,cb)=>{saved=data;cb(null,data);},update:(data,id,cb)=>{saved=data;cb(null,{...data,affectedRows:1});}}};
const controller=require('../controllers/khuyenmai.controller');
const base={MaKhuyenMai:' autumn10 ',TenKhuyenMai:' Autumn ',PhanTramGiam:10,SoTienGiam:0,NgayBatDau:'2026-10-01 00:00:00',NgayKetThuc:'2026-10-31 23:59:59',TrangThai:'ACTIVE',DieuKien:null};
test('admin promotion creation/update validate one discount type and database field limits',()=>{
 for(const sample of require('./promotion-cases.json'))for(const method of ['create','update']){
  const res={statusCode:200,status(n){this.statusCode=n;return this},json(body){this.body=body;return this}};
  controller[method]({params:{KhuyenMaiID:1},body:{...base,...sample.patch}},res);
  assert.equal(res.statusCode,sample.valid?(method==='create'?201:200):400,sample.name+' '+method);
  if(sample.valid){assert.equal(saved.MaKhuyenMai,'AUTUMN10');assert.equal(saved.TenKhuyenMai,'Autumn');}
 }
});
