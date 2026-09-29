const express = require('express');
const router = express.Router();

const MaqrController = require('../controllers/maqr.controller');

router.get('/', MaqrController.getAll);
router.get('/admin', MaqrController.getAdmin);
router.get('/:MaQRID', MaqrController.getById);
router.patch('/:MaQRID/revoke', MaqrController.revoke);
router.post('/', MaqrController.create);
router.put('/:MaQRID', MaqrController.update);
router.delete('/:MaQRID', MaqrController.delete);

module.exports = router;
