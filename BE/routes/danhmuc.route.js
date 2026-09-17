const express = require('express');
const router = express.Router();

const DanhmucController = require('../controllers/danhmuc.controller');

router.get('/', DanhmucController.getAll);
router.get('/:DanhMucID', DanhmucController.getById);
router.post('/', DanhmucController.create);
router.put('/:DanhMucID', DanhmucController.update);
router.delete('/:DanhMucID', DanhmucController.delete);

module.exports = router;
