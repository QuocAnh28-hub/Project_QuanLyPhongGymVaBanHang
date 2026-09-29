const Report = require('../models/report.model');

exports.getAdmin = async (req, res) => {
  const date = value => /^\d{4}-\d{2}-\d{2}$/.test(value || '') && !Number.isNaN(Date.parse(`${value}T00:00:00`));
  let from = req.query.from, to = req.query.to;
  if (!date(from) || !date(to) || from > to) return res.status(400).json({ message: 'Khoảng ngày không hợp lệ' });
  const exclusive = new Date(`${to}T00:00:00`); exclusive.setDate(exclusive.getDate() + 1);
  const end = `${exclusive.getFullYear()}-${String(exclusive.getMonth()+1).padStart(2,'0')}-${String(exclusive.getDate()).padStart(2,'0')}`;
  try { res.json(await Report.getAdmin(`${from} 00:00:00`, `${end} 00:00:00`)); }
  catch (error) { console.error('Report error', error); res.status(500).json({ message: 'Không thể tải báo cáo từ cơ sở dữ liệu' }); }
};
