import assert from 'node:assert/strict'
import fs from 'node:fs'
import { dateInput, previewDiscount, promotionState, promotionTime, validatePromotion } from '../src/services/promotions.ts'
const base={MaKhuyenMai:' autumn10 ',TenKhuyenMai:' Autumn ',PhanTramGiam:10,SoTienGiam:0,NgayBatDau:'2026-10-01 00:00:00',NgayKetThuc:'2026-10-31 23:59:59',TrangThai:'ACTIVE',DieuKien:null}
const cases=JSON.parse(fs.readFileSync(new URL('../../BE/tests/promotion-cases.json',import.meta.url),'utf8'))
for(const sample of cases){if(sample.valid)assert.equal(validatePromotion({...base,...sample.patch}).MaKhuyenMai,'AUTUMN10');else assert.throws(()=>validatePromotion({...base,...sample.patch}),undefined,sample.name)}
const start=promotionTime(base.NgayBatDau).getTime(),end=promotionTime(base.NgayKetThuc).getTime()
assert.equal(promotionState(base,start-1),'UPCOMING');assert.equal(promotionState(base,start),'ACTIVE');assert.equal(promotionState(base,end),'ACTIVE');assert.equal(promotionState(base,end+1),'EXPIRED');assert.equal(promotionState({...base,TrangThai:'INACTIVE'},end+1),'STOPPED')
assert.equal(dateInput('2026-10-08T02:30:15.000Z'),'2026-10-08T09:30:15');assert.equal(dateInput('2026-10-08 09:30:15'),'2026-10-08T09:30:15')
assert.equal(previewDiscount(815000,12.34,0),100571);assert.equal(previewDiscount(490000,0,500000),490000);assert.equal(previewDiscount(1000,10,500),500)
console.log('PASS: shared FE/BE validation cases, inclusive Vietnam time boundaries, exact edit times and existing redemption math.')
