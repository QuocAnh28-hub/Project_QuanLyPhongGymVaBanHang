const express = require('express');
const router = express.Router();

const ChitietdonhangController = require('../controllers/chitietdonhang.controller');

router.get('/', ChitietdonhangController.getAll);
router.get('/:ChiTietDonHangID', ChitietdonhangController.getById);
router.post('/', ChitietdonhangController.create);
router.put('/:ChiTietDonHangID', ChitietdonhangController.update);
router.delete('/:ChiTietDonHangID', ChitietdonhangController.delete);

module.exports = router;
