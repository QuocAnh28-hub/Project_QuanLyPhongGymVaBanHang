const express = require('express');
const router = express.Router();

const DonhangController = require('../controllers/donhang.controller');

router.get('/', DonhangController.getAll);
router.get('/:DonHangID', DonhangController.getById);
router.post('/', DonhangController.create);
router.put('/:DonHangID', DonhangController.update);
router.delete('/:DonHangID', DonhangController.delete);

module.exports = router;
