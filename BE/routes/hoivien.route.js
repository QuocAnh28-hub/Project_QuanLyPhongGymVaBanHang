const express = require('express');
const router = express.Router();

const HoivienController = require('../controllers/hoivien.controller');
const imageUpload = require('../middleware/image-upload');

router.post('/:HoiVienID/upload-image', (req, res, next) => {
  if (!/^[1-9]\d*$/.test(req.params.HoiVienID)) return res.status(400).json({ message: 'HoiVienID không hợp lệ.' });
  next();
}, imageUpload('members'));

router.get('/', HoivienController.getAll);
router.get('/account/:TaiKhoanID', HoivienController.getByAccount);
router.put('/account/:TaiKhoanID', HoivienController.updateByAccount);
router.get('/:HoiVienID', HoivienController.getById);
router.post('/', HoivienController.create);
router.put('/:HoiVienID', HoivienController.update);
router.delete('/:HoiVienID', HoivienController.delete);

module.exports = router;
