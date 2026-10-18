const express = require('express');
const router = express.Router();

const ApdungkhuyenmaidonhangController = require('../controllers/apdungkhuyenmaidonhang.controller');

router.get('/', ApdungkhuyenmaidonhangController.getAll);
router.get('/:ApDungKhuyenMaiID', ApdungkhuyenmaidonhangController.getById);
router.post('/', ApdungkhuyenmaidonhangController.create);
router.put('/:ApDungKhuyenMaiID', ApdungkhuyenmaidonhangController.update);
router.delete('/:ApDungKhuyenMaiID', ApdungkhuyenmaidonhangController.delete);

module.exports = router;
