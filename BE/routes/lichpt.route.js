const express = require('express');
const router = express.Router();

const LichptController = require('../controllers/lichpt.controller');

router.get('/', LichptController.getAll);
router.get('/:LichPTID', LichptController.getById);
router.post('/', LichptController.create);
router.put('/:LichPTID', LichptController.update);
router.delete('/:LichPTID', LichptController.delete);

module.exports = router;
