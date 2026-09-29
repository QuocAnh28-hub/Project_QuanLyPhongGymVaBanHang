const Goitap = require('../models/goitap.model');
const id = value => Number.isInteger(Number(value)) && Number(value) > 0 ? Number(value) : null;
const fail = (res, error, message) => res.status(error.status || 500).json({ message: error.message || message });

function packageInput(body) {
  const value = {
    TenGoi: String(body?.TenGoi || '').trim(), MoTa: String(body?.MoTa || '').trim(),
    GoiTapThoiHanID: id(body?.GoiTapThoiHanID), SoThang: Number(body?.SoThang),
    ThangTang: Number(body?.ThangTang || 0), GiaGoc: Number(body?.GiaGoc ?? body?.GiaBan),
    GiaBan: Number(body?.GiaBan), TrangThai: body?.TrangThai,
    QuyenLoi: Array.isArray(body?.QuyenLoi) ? body.QuyenLoi.map(String).map(x => x.trim()).filter(Boolean) : []
  };
  return value.TenGoi && Number.isInteger(value.SoThang) && value.SoThang > 0 && value.ThangTang >= 0 && value.GiaGoc >= 0 && value.GiaBan >= 0 && ['ACTIVE', 'INACTIVE'].includes(value.TrangThai) ? value : null;
}

module.exports = {
  getAll: (_req, res) => Goitap.getAll((e, rows) => e ? fail(res, e, 'Không thể tải gói tập') : res.json(rows)),
  getById: (req, res) => Goitap.getById(req.params.GoiTapID, (e, rows) => e ? fail(res, e, 'Không thể tải gói tập') : rows.length ? res.json(rows[0]) : res.status(404).json({ message: 'Không tìm thấy gói tập' })),
  getActive: (_req, res) => Goitap.getActive((e, rows) => e ? fail(res, e, 'Không thể tải gói tập') : res.json(rows)),
  getActiveById: (req, res) => {
    const packageId = id(req.params.GoiTapID);
    if (!packageId) return res.status(400).json({ message: 'GoiTapID không hợp lệ' });
    Goitap.getActiveDetailById(packageId, (e, row) => e ? fail(res, e, 'Không thể tải gói tập') : row ? res.json(row) : res.status(404).json({ message: 'Không tìm thấy gói tập đang hoạt động' }));
  },
  create: (req, res) => {
    const data = packageInput(req.body);
    if (!data) return res.status(400).json({ message: 'Dữ liệu gói tập không hợp lệ' });
    Goitap.saveAdmin(null, data, (e, result) => e ? fail(res, e, 'Thêm gói tập thất bại') : res.status(201).json({ message: 'Đã thêm gói tập', data: result }));
  },
  update: (req, res) => {
    const packageId = id(req.params.GoiTapID), data = packageInput(req.body);
    if (!packageId || !data?.GoiTapThoiHanID) return res.status(400).json({ message: 'Dữ liệu gói tập không hợp lệ' });
    Goitap.saveAdmin(packageId, data, (e, result) => e ? fail(res, e, 'Cập nhật gói tập thất bại') : res.json({ message: 'Đã cập nhật gói tập', data: result }));
  },
  setStatus: (req, res) => {
    const packageId = id(req.params.GoiTapID), status = req.body?.TrangThai;
    if (!packageId || !['ACTIVE', 'INACTIVE'].includes(status)) return res.status(400).json({ message: 'Dữ liệu không hợp lệ' });
    Goitap.setStatus(packageId, status, (e, result) => e ? fail(res, e, 'Cập nhật trạng thái thất bại') : !result.affectedRows ? res.status(404).json({ message: 'Không tìm thấy gói tập' }) : res.json({ data: { GoiTapID: packageId, TrangThai: status } }));
  },
  delete: (req, res) => {
    const packageId = id(req.params.GoiTapID);
    if (!packageId) return res.status(400).json({ message: 'GoiTapID không hợp lệ' });
    Goitap.safeDelete(packageId, (e, result) => e ? fail(res, e, 'Xóa gói tập thất bại') : res.json({ message: result.deleted ? 'Đã xóa gói tập' : 'Gói có lịch sử nên đã chuyển INACTIVE', data: result }));
  }
};
