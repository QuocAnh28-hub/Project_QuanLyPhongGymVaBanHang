const {test}=require('node:test');
const assert=require('assert/strict');
const {transferInfo,crc16}=require('../common/shop-payment-qr');
const parse=value=>{
 const fields={};
 for(let i=0;i<value.length;){const tag=value.slice(i,i+2),n=Number(value.slice(i+2,i+4));fields[tag]=value.slice(i+4,i+4+n);assert.equal(fields[tag].length,n);i+=4+n;}
 return fields;
};
test('local VietQR encodes actual bank, order amount, reference and valid CRC',()=>{
 const original={...process.env};
 try{
  process.env.SHOP_BANK_BIN='970407';process.env.SHOP_BANK_ACCOUNT='4444448888';process.env.SHOP_BANK_NAME='LE HUY HOANG';
  assert.equal(crc16('123456789'),'29B1');
  const info=transferInfo({DonHangID:123,ThanhToanID:456,TongTien:'265001.00'});
  const top=parse(info.qrPayload),provider=parse(top['38']),bank=parse(provider['01']);
  assert.equal(top['54'],'265001');assert.equal(top['53'],'704');assert.equal(top['58'],'VN');
  assert.equal(bank['00'],'970407');assert.equal(bank['01'],'4444448888');
  assert.equal(provider['00'],'A000000727');assert.equal(provider['02'],'QRIBFTTA');
  assert.equal(parse(top['62'])['08'],'QAGYM DH123 TT456');
  assert.equal(top['63'],crc16(info.qrPayload.slice(0,-4)));
  assert.notEqual(info.qrPayload,transferInfo({DonHangID:124,ThanhToanID:457,TongTien:'150000.00'}).qrPayload);
  delete process.env.SHOP_BANK_ACCOUNT;
  assert.equal(transferInfo({DonHangID:1,ThanhToanID:2,TongTien:12000}),null);
 }finally{for(const key of ['SHOP_BANK_BIN','SHOP_BANK_ACCOUNT','SHOP_BANK_NAME']){if(original[key]===undefined)delete process.env[key];else process.env[key]=original[key];}}
});
