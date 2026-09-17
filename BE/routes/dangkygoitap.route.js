const express = require('express');
const router = express.Router();

const DangkygoitapController = require('../controllers/dangkygoitap.controller');

router.get('/', DangkygoitapController.getAll);
router.get('/:DangKyID', DangkygoitapController.getById);
router.post('/', DangkygoitapController.create);
router.put('/:DangKyID', DangkygoitapController.update);
router.delete('/:DangKyID', DangkygoitapController.delete);

module.exports = router;
