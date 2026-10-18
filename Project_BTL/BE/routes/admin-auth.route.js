const router = require('express').Router();
const { login } = require('./auth.route');
const { requireAuth, requireRole } = require('../middleware/auth');
const employees = require('../controllers/admin-employees.controller');
const admin = requireRole('ADMIN');

router.post('/login', (req, res) => { req.requiredRole = 'ADMIN'; login(req, res); });
router.get('/session', requireAuth, admin, (req, res) => res.set('Cache-Control', 'no-store').json({ account: req.auth, expiresAt: req.authExpiresAt }));
router.post('/logout', requireAuth, admin, (_req, res) => res.sendStatus(204));
router.use('/employees', requireAuth, admin, (req, _res, next) => { req.adminAccountId = req.auth.TaiKhoanID; next(); });
router.get('/employees', employees.list);
router.post('/employees', employees.create);
router.put('/employees/:id', employees.update);
router.put('/employees/:id/access', employees.access);
module.exports = router;
