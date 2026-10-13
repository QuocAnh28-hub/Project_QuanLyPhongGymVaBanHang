const router = require('express').Router();
const equipment = require('../models/maytap.model');
const { requireRole } = require('../middleware/auth');
const imageUpload = require('../middleware/image-upload');
const admin = requireRole('ADMIN');
const idOf = req => {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id <= 0) throw Object.assign(new Error('Mã máy tập không hợp lệ.'), { status: 400 });
  return id;
};
const failure = (res, error) => res.status(error.code === 'ER_DUP_ENTRY' ? 409 : 500).json({
  message: error.code === 'ER_DUP_ENTRY' ? 'Mã máy đã tồn tại.' : 'Không thể xử lý dữ liệu máy tập.',
});
router.get('/active', (req, res) => equipment.list(true, (error, rows) => error ? failure(res, error) : res.json(rows)));
router.get('/', admin, (req, res) => equipment.list(false, (error, rows) => error ? failure(res, error) : res.json(rows)));
router.post('/upload-image', admin, imageUpload('equipment'));
for (const method of ['post', 'put']) router[method](method === 'post' ? '/' : '/:id', admin, (req, res) => {
  let row, id;
  try { row = equipment.validateEquipment(req.body); if (method === 'put') id = idOf(req); }
  catch (error) { return res.status(400).json({ message: error.message }); }
  const done = (error, result) => {
    if (error) return failure(res, error);
    if (method === 'put' && !result.affectedRows) return res.status(404).json({ message: 'Không tìm thấy máy tập.' });
    res.status(method === 'post' ? 201 : 200).json({ message: 'Đã lưu máy tập.', MayTapID: id || result.insertId });
  };
  if (method === 'post') equipment.create(row, done); else equipment.update(id, row, done);
});
router.delete('/:id', admin, (req, res) => {
  let id;
  try { id = idOf(req); } catch (error) { return res.status(400).json({ message: error.message }); }
  equipment.remove(id, (error, result) => {
    if (error) return failure(res, error);
    if (!result.affectedRows) return res.status(404).json({ message: 'Không tìm thấy máy tập.' });
    res.json({ message: 'Đã xóa máy tập.' });
  });
});
module.exports = router;
