const Promotion = require('../models/khuyenmai.model');
const id = value => Number.isInteger(Number(value)) && Number(value)>0;
const valid = data => {
  const percent=Number(data?.PhanTramGiam||0), amount=Number(data?.SoTienGiam||0);
  return data && String(data.MaKhuyenMai||'').trim() && String(data.TenKhuyenMai||'').trim()
    && percent>=0 && percent<=100 && amount>=0 && (percent>0 || amount>0)
    && !Number.isNaN(Date.parse(data.NgayBatDau)) && !Number.isNaN(Date.parse(data.NgayKetThuc))
    && new Date(data.NgayBatDau)<=new Date(data.NgayKetThuc)
    && ['ACTIVE','INACTIVE','EXPIRED'].includes(data.TrangThai);
};
const error = (res,e,message) => res.status(e?.code==='ER_DUP_ENTRY'?409:500).json({message:e?.code==='ER_DUP_ENTRY'?'Mã khuyến mãi đã tồn tại':message});
exports.getAll=(req,res)=>Promotion.getAll((e,rows)=>e?error(res,e,'Không thể tải khuyến mãi'):res.json(rows));
exports.getStats=(req,res)=>Promotion.getStats((e,row)=>e?error(res,e,'Không thể tải thống kê'):res.json(row));
exports.getHistory=(req,res)=>Promotion.getHistory((e,rows)=>e?error(res,e,'Không thể tải lịch sử'):res.json(rows));
exports.getById=(req,res)=>!id(req.params.KhuyenMaiID)?res.status(400).json({message:'ID không hợp lệ'}):Promotion.getById(req.params.KhuyenMaiID,(e,rows)=>e?error(res,e,'Không thể tải khuyến mãi'):rows.length?res.json(rows[0]):res.status(404).json({message:'Không tìm thấy khuyến mãi'}));
exports.create=(req,res)=>!valid(req.body)?res.status(400).json({message:'Dữ liệu khuyến mãi không hợp lệ'}):Promotion.insert(req.body,(e,row)=>e?error(res,e,'Không thể tạo khuyến mãi'):res.status(201).json(row));
exports.update=(req,res)=>!id(req.params.KhuyenMaiID)||!valid(req.body)?res.status(400).json({message:'Dữ liệu khuyến mãi không hợp lệ'}):Promotion.update(req.body,req.params.KhuyenMaiID,(e,row)=>e?error(res,e,'Không thể cập nhật khuyến mãi'):row.affectedRows?res.json(row):res.status(404).json({message:'Không tìm thấy khuyến mãi'}));
exports.delete=(req,res)=>!id(req.params.KhuyenMaiID)?res.status(400).json({message:'ID không hợp lệ'}):Promotion.deactivate(req.params.KhuyenMaiID,(e,r)=>e?error(res,e,'Không thể ngừng khuyến mãi'):r.affectedRows?res.json({KhuyenMaiID:Number(req.params.KhuyenMaiID),TrangThai:'INACTIVE'}):res.status(404).json({message:'Không tìm thấy khuyến mãi'}));
