const express = require('express');
const router = express.Router();

const HoivienController = require('../controllers/hoivien.controller');

router.get('/', HoivienController.getAll);
router.get('/:HoiVienID', HoivienController.getById);
router.post('/', HoivienController.create);
router.put('/:HoiVienID', HoivienController.update);
router.delete('/:HoiVienID', HoivienController.delete);

module.exports = router;
