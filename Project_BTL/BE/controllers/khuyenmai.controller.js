const Promotion = require('../models/khuyenmai.model');
const id = value => Number.isInteger(Number(value)) && Number(value)>0;
const validDate = value => {
  if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value))return false;
  const date=new Date(value.replace(' ','T')+'Z');
  return Number.isFinite(date.getTime())&&date.toISOString().slice(0,19).replace('T',' ')===value;
};
const valid = data => {
  const percent=Number(data?.PhanTramGiam ?? 0),amount=Number(data?.SoTienGiam ?? 0);
  const decimal=n=>Number.isFinite(n)&&Math.abs(n*100-Math.round(n*100))<0.001;
  return data && typeof data.MaKhuyenMai==='string' && /^[A-Z0-9_-]{2,50}$/.test(data.MaKhuyenMai.trim().toUpperCase())
    && typeof data.TenKhuyenMai==='string' && data.TenKhuyenMai.trim().length>0 && data.TenKhuyenMai.trim().length<=150
    && decimal(percent)&&decimal(amount)&&percent>=0&&percent<=100&&amount>=0&&amount<=9999999999999.99
    && ((percent>0&&amount===0)||(amount>0&&percent===0))
    && validDate(data.NgayBatDau)&&validDate(data.NgayKetThuc)&&data.NgayBatDau<=data.NgayKetThuc
    && (data.DieuKien==null||(typeof data.DieuKien==='string'&&data.DieuKien.length<=10000))
    && ['ACTIVE','INACTIVE','EXPIRED'].includes(data.TrangThai);
};
const normalized=data=>({...data,MaKhuyenMai:data.MaKhuyenMai.trim().toUpperCase(),TenKhuyenMai:data.TenKhuyenMai.trim(),PhanTramGiam:Number(data.PhanTramGiam ?? 0),SoTienGiam:Number(data.SoTienGiam ?? 0)});
const error = (res,e,message) => res.status(e?.code==='ER_DUP_ENTRY'?409:500).json({message:e?.code==='ER_DUP_ENTRY'?'Mã khuyến mãi đã tồn tại':message});
exports.getAll=(req,res)=>Promotion.getAll((e,rows)=>e?error(res,e,'Không thể tải khuyến mãi'):res.json(rows));
exports.getStats=(req,res)=>Promotion.getStats((e,row)=>e?error(res,e,'Không thể tải thống kê'):res.json(row));
exports.getHistory=(req,res)=>Promotion.getHistory((e,rows)=>e?error(res,e,'Không thể tải lịch sử'):res.json(rows));
exports.getById=(req,res)=>!id(req.params.KhuyenMaiID)?res.status(400).json({message:'ID không hợp lệ'}):Promotion.getById(req.params.KhuyenMaiID,(e,rows)=>e?error(res,e,'Không thể tải khuyến mãi'):rows.length?res.json(rows[0]):res.status(404).json({message:'Không tìm thấy khuyến mãi'}));
exports.create=(req,res)=>!valid(req.body)?res.status(400).json({message:'Kiểm tra mã (2–50 ký tự A–Z, 0–9, _ hoặc -), tên, thời gian và chỉ một mức giảm dương (% tối đa 100 hoặc tiền cố định).'}):Promotion.insert(normalized(req.body),(e,row)=>e?error(res,e,'Không thể tạo khuyến mãi'):res.status(201).json(row));
exports.update=(req,res)=>!id(req.params.KhuyenMaiID)||!valid(req.body)?res.status(400).json({message:'Kiểm tra mã, tên, thời gian và chỉ chọn một loại giảm giá.'}):Promotion.update(normalized(req.body),req.params.KhuyenMaiID,(e,row)=>e?error(res,e,'Không thể cập nhật khuyến mãi'):row.affectedRows?res.json(row):res.status(404).json({message:'Không tìm thấy khuyến mãi'}));
exports.delete=(req,res)=>!id(req.params.KhuyenMaiID)?res.status(400).json({message:'ID không hợp lệ'}):Promotion.deactivate(req.params.KhuyenMaiID,(e,r)=>e?error(res,e,'Không thể ngừng khuyến mãi'):r.affectedRows?res.json({KhuyenMaiID:Number(req.params.KhuyenMaiID),TrangThai:'INACTIVE'}):res.status(404).json({message:'Không tìm thấy khuyến mãi'}));
