const express = require('express');
const router = express.Router();

const SanphamController = require('../controllers/sanpham.controller');
const imageUpload = require('../middleware/image-upload');

router.post('/upload-image', imageUpload('products'));

router.get('/', SanphamController.getAll);
router.get('/:SanPhamID', SanphamController.getById);
router.post('/', SanphamController.create);
router.put('/:SanPhamID', SanphamController.update);
router.delete('/:SanPhamID', SanphamController.delete);

module.exports = router;
