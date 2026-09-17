const express = require('express');
const router = express.Router();

const PhieunhapController = require('../controllers/phieunhap.controller');

router.get('/', PhieunhapController.getAll);
router.get('/:PhieuNhapID', PhieunhapController.getById);
router.post('/', PhieunhapController.create);
router.put('/:PhieuNhapID', PhieunhapController.update);
router.delete('/:PhieuNhapID', PhieunhapController.delete);

module.exports = router;
