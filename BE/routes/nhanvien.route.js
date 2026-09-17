const express = require('express');
const router = express.Router();

const NhanvienController = require('../controllers/nhanvien.controller');

router.get('/', NhanvienController.getAll);
router.get('/:NhanVienID', NhanvienController.getById);
router.post('/', NhanvienController.create);
router.put('/:NhanVienID', NhanvienController.update);
router.delete('/:NhanVienID', NhanvienController.delete);

module.exports = router;
