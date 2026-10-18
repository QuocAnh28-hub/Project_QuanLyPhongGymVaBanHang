const express = require('express');
const router = express.Router();

const ChitietgiohangController = require('../controllers/chitietgiohang.controller');

router.get('/', ChitietgiohangController.getAll);
router.get('/:ChiTietGioHangID', ChitietgiohangController.getById);
router.post('/', ChitietgiohangController.create);
router.put('/:ChiTietGioHangID', ChitietgiohangController.update);
router.delete('/:ChiTietGioHangID', ChitietgiohangController.delete);

module.exports = router;
