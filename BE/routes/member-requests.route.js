const router = require('express').Router();
const model = require('../models/member-requests.model');
const { requireRole } = require('../middleware/auth');
const handle = fn => async (req,res,next) => {
  try { res.json(await fn(req)); } catch (e) { next(e); }
};
router.get('/student/me', requireRole('CUSTOMER'), handle(req => model.getStudent(req.auth.TaiKhoanID)));
router.post('/student/me', requireRole('CUSTOMER'), handle(req => model.submitStudent(req.auth.TaiKhoanID,req.body)));
router.get('/student', requireRole('ADMIN'), handle(() => model.listStudents()));
router.post('/student/:id/review', requireRole('ADMIN'), handle(req => model.reviewStudent(req.params.id,req.body.TrangThai)));
router.get('/freeze/me', requireRole('CUSTOMER'), handle(req => model.listFreezes(req.auth.TaiKhoanID)));
router.post('/freeze/me', requireRole('CUSTOMER'), handle(req => model.requestFreeze(req.auth.TaiKhoanID,req.body)));
router.get('/freeze', requireRole('ADMIN'), handle(() => model.listFreezes(null)));
router.post('/freeze/:id/review', requireRole('ADMIN'), handle(req => model.reviewFreeze(req.params.id,req.body.TrangThai)));
module.exports = router;
