const express = require('express');
const router = express.Router();

const KhuyenmaiController = require('../controllers/khuyenmai.controller');

router.get('/', KhuyenmaiController.getAll);
router.get('/:KhuyenMaiID', KhuyenmaiController.getById);
router.post('/', KhuyenmaiController.create);
router.put('/:KhuyenMaiID', KhuyenmaiController.update);
router.delete('/:KhuyenMaiID', KhuyenmaiController.delete);

module.exports = router;
