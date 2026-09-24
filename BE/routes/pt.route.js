const express = require('express');
const router = express.Router();

const PtController = require('../controllers/pt.controller');

router.get('/', PtController.getAll);
router.get('/active', PtController.getActive);
router.get('/active/:PTID', PtController.getActiveById);
router.get('/:PTID', PtController.getById);
router.post('/', PtController.create);
router.put('/:PTID', PtController.update);
router.delete('/:PTID', PtController.delete);

module.exports = router;
