const express = require('express');
const router = express.Router();

const PhieunhapController = require('../controllers/phieunhap.controller');
const receipt = require('../controllers/warehouse-receipt.controller');

router.post('/with-items', receipt.create);
router.post('/:PhieuNhapID/status', receipt.transition);

router.get('/', PhieunhapController.getAll);
router.get('/:PhieuNhapID', PhieunhapController.getById);
router.post('/', PhieunhapController.create);
router.put('/:PhieuNhapID', PhieunhapController.update);
router.delete('/:PhieuNhapID', PhieunhapController.delete);

module.exports = router;
