const express = require('express');
const router = express.Router();

const ApdungkhuyenmaigoitapController = require('../controllers/apdungkhuyenmaigoitap.controller');

router.get('/', ApdungkhuyenmaigoitapController.getAll);
router.get('/:ApDungKhuyenMaiID', ApdungkhuyenmaigoitapController.getById);
router.post('/', ApdungkhuyenmaigoitapController.create);
router.put('/:ApDungKhuyenMaiID', ApdungkhuyenmaigoitapController.update);
router.delete('/:ApDungKhuyenMaiID', ApdungkhuyenmaigoitapController.delete);

module.exports = router;
