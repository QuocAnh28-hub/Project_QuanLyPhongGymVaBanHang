const express = require('express');
const router = express.Router();

const SanphamController = require('../controllers/sanpham.controller');

router.get('/', SanphamController.getAll);
router.get('/:SanPhamID', SanphamController.getById);
router.post('/', SanphamController.create);
router.put('/:SanPhamID', SanphamController.update);
router.delete('/:SanPhamID', SanphamController.delete);

module.exports = router;
