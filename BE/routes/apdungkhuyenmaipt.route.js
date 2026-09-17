const express = require('express');
const router = express.Router();

const ApdungkhuyenmaiptController = require('../controllers/apdungkhuyenmaipt.controller');

router.get('/', ApdungkhuyenmaiptController.getAll);
router.get('/:ApDungKhuyenMaiID', ApdungkhuyenmaiptController.getById);
router.post('/', ApdungkhuyenmaiptController.create);
router.put('/:ApDungKhuyenMaiID', ApdungkhuyenmaiptController.update);
router.delete('/:ApDungKhuyenMaiID', ApdungkhuyenmaiptController.delete);

module.exports = router;
