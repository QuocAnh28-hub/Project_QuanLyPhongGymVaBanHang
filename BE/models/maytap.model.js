const db = require('../common/db');

const groups = ['CARDIO', 'STRENGTH', 'MULTI'];
const statuses = ['ACTIVE', 'MAINTENANCE', 'INACTIVE'];
function validateEquipment(body = {}) {
  const text = (key, max, required = false) => {
    if (body[key] != null && typeof body[key] !== 'string') throw new Error(`${key} phải là chuỗi.`);
    const value = (body[key] || '').trim();
    if ((required && !value) || value.length > max) throw new Error(`${key} không hợp lệ (tối đa ${max} ký tự).`);
    return value;
  };
  const row = {
    MaMay: text('MaMay', 60, true), TenMay: text('TenMay', 150, true),
    NhomMay: text('NhomMay', 20, true), NhomCo: text('NhomCo', 200),
    MoTa: text('MoTa', 5000, true), HinhAnh: text('HinhAnh', 255) || null,
    SoLuong: Number(body.SoLuong), ViTri: text('ViTri', 150), TrangThai: text('TrangThai', 20, true),
  };
  if (!/^[a-zA-Z0-9_-]+$/.test(row.MaMay)) throw new Error('Mã máy chỉ gồm chữ không dấu, số, dấu gạch ngang hoặc gạch dưới.');
  if (!groups.includes(row.NhomMay) || !statuses.includes(row.TrangThai)) throw new Error('Nhóm máy hoặc trạng thái không hợp lệ.');
  if (!Number.isInteger(row.SoLuong) || row.SoLuong < 1 || row.SoLuong > 10000) throw new Error('Số lượng phải là số nguyên từ 1 đến 10.000.');
  if (row.HinhAnh && !/^https?:\/\/[^\s]+$|^\/uploads\/[a-zA-Z0-9/_\-.]+$/.test(row.HinhAnh)) throw new Error('Ảnh phải là URL HTTP/HTTPS hoặc đường dẫn /uploads/.');
  return row;
}
module.exports = {
  validateEquipment,
  list: (active, callback) => db.query(`SELECT * FROM maytap ${active ? "WHERE TrangThai='ACTIVE'" : ''} ORDER BY NhomMay, TenMay, MayTapID`, callback),
  create: (row, callback) => db.query('INSERT INTO maytap SET ?', row, callback),
  update: (id, row, callback) => db.query('UPDATE maytap SET ? WHERE MayTapID=?', [row, id], callback),
  remove: (id, callback) => db.query('DELETE FROM maytap WHERE MayTapID=?', [id], callback),
};
