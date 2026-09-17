const express = require('express');
const router = express.Router();

const ChitietphieunhapController = require('../controllers/chitietphieunhap.controller');

router.get('/', ChitietphieunhapController.getAll);
router.get('/:ChiTietPhieuNhapID', ChitietphieunhapController.getById);
router.post('/', ChitietphieunhapController.create);
router.put('/:ChiTietPhieuNhapID', ChitietphieunhapController.update);
router.delete('/:ChiTietPhieuNhapID', ChitietphieunhapController.delete);

module.exports = router;
