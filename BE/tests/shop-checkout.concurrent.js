const assert=require('assert/strict');
const {randomUUID}=require('crypto');
const db=require('../common/db');
const mysql=require('mysql2/promise');
(async()=>{
 const setup=await db.promise().getConnection();
 const testDb=`gym_checkout_concurrency_${Date.now()}`;
 let pool;
 const previousWarehouse=process.env.SHOP_WAREHOUSE_ID;
 try{
  const [[source]]=await setup.query('SELECT DATABASE() name');
  await setup.query('CREATE DATABASE ??',[testDb]);
  for(const t of ['taikhoan','hoivien','danhmuc','sanpham','kho','tonkho','giohang','chitietgiohang','donhang','chitietdonhang','thanhtoan','nhanvien','hoadon','shopcheckout'])
   await setup.query('CREATE TABLE ??.?? LIKE ??.??',[testDb,t,source.name,t]);
  pool=mysql.createPool({host:process.env.DB_HOST,port:+(process.env.DB_PORT||3306),user:process.env.DB_USER,password:process.env.DB_PASSWORD,database:testDb,connectionLimit:4});
  const write=async(sql,args=[])=>{const [r]=await pool.query(sql,args);return r.insertId;};
  const account=await write("INSERT INTO taikhoan (Email,MatKhau) VALUES (?,?)",['checkout@example.invalid',randomUUID()]);
  const member=await write('INSERT INTO hoivien (TaiKhoanID,HoTen,SoDienThoai) VALUES (?,?,?)',[account,'Concurrency Test','0912345678']);
  const warehouse=await write('INSERT INTO kho (TenKho) VALUES (?)',['Test warehouse']);process.env.SHOP_WAREHOUSE_ID=String(warehouse);
  const category=await write('INSERT INTO danhmuc (TenDanhMuc) VALUES (?)',['Test category']);
  const product=await write('INSERT INTO sanpham (DanhMucID,TenSanPham,GiaBan) VALUES (?,?,?)',[category,'Test product',12000]);
  await write('INSERT INTO tonkho (KhoID,SanPhamID,SoLuongTon) VALUES (?,?,20)',[warehouse,product]);
  const cart=await write('INSERT INTO giohang (HoiVienID) VALUES (?)',[member]);
  await write('INSERT INTO chitietgiohang (GioHangID,SanPhamID,SoLuong) VALUES (?,?,2)',[cart,product]);
  const dbPath=require.resolve('../common/db');require.cache[dbPath].exports={promise:()=>pool};
  const controller=require('../controllers/shop-checkout.controller');
  const call=async(method,body={},params={})=>{
   const res={statusCode:200,status(n){this.statusCode=n;return this},json(data){this.body=data;return this}};
   await controller[method]({params:{accountId:account,...params},body,auth:{VaiTro:'ADMIN',TaiKhoanID:account}},res);
   return res;
  };
  const preview=(await call('preview')).body;
  const input={requestKey:preview.requestKey,cartVersion:preview.cartVersion,name:'Concurrency Test',phone:'0912345678',delivery:'PICKUP',address:'',note:'',paymentMethod:'TIEN_MAT'};
  const orders=await Promise.all([call('create',input),call('create',input)]);
  for(const r of orders){assert.equal(r.statusCode,200,JSON.stringify(r.body));assert.equal(r.body.TrangThaiThanhToan,'PENDING');}
  assert.equal(orders[0].body.DonHangID,orders[1].body.DonHangID);
  // A response lost after commit is recovered by the same persisted request key.
  assert.equal((await call('byRequest',{}, {requestKey:input.requestKey})).body.DonHangID,orders[0].body.DonHangID);
  for(const t of ['donhang','thanhtoan','shopcheckout']){const [[r]]=await pool.query('SELECT COUNT(*) n FROM ??',[t]);assert.equal(r.n,1);}
  const confirmed=await Promise.all([call('confirmManual',{}, {orderId:orders[0].body.DonHangID}),call('confirmManual',{}, {orderId:orders[0].body.DonHangID})]);
  for(const r of confirmed)assert.equal(r.statusCode,200,JSON.stringify(r.body));
  const [[invoices]]=await pool.query('SELECT COUNT(*) n FROM hoadon');assert.equal(invoices.n,1);
  const [[stock]]=await pool.query('SELECT SoLuongTon FROM tonkho');assert.equal(stock.SoLuongTon,18);
  console.log('PASS: concurrent checkout + recovery produce one order/payment; concurrent manual confirmation produces one invoice and one stock deduction.');
 }finally{
  if(previousWarehouse===undefined)delete process.env.SHOP_WAREHOUSE_ID;else process.env.SHOP_WAREHOUSE_ID=previousWarehouse;
  if(pool)await pool.end();
  await setup.query('DROP DATABASE IF EXISTS ??',[testDb]);setup.release();await db.promise().end();
 }
})().catch(e=>{console.error(e.message);process.exitCode=1});
