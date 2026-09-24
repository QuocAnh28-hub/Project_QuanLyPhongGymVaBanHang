const express = require('express');
const router = express.Router();

const GiohangController = require('../controllers/giohang.controller');
const shopCart = require('../controllers/shop-cart.controller');

router.get('/account/:accountId/items', shopCart);
router.post('/account/:accountId/items', shopCart);
router.put('/account/:accountId/items', shopCart);

router.get('/', GiohangController.getAll);
router.get('/:GioHangID', GiohangController.getById);
router.post('/', GiohangController.create);
router.put('/:GioHangID', GiohangController.update);
router.delete('/:GioHangID', GiohangController.delete);

module.exports = router;
