const multer = require('multer');
const path = require('path');
const fs = require('fs/promises');
const { randomUUID } = require('crypto');

const types = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' };
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter(req, file, callback) {
    const extension = path.extname(file.originalname).toLowerCase();
    const allowed = file.mimetype === 'image/jpeg' ? ['.jpg', '.jpeg'] : [types[file.mimetype]];
    if (!types[file.mimetype] || !allowed.includes(extension)) return callback(new Error('Chỉ chấp nhận ảnh JPG, PNG hoặc WEBP.'));
    callback(null, true);
  }
}).single('image');

module.exports = function imageUpload(folder) {
  const directory = path.join(__dirname, '..', 'uploads', folder);
  return (req, res, next) => {
    upload(req, res, async error => {
      if (error) return res.status(400).json({ message: error.code === 'LIMIT_FILE_SIZE' ? 'Ảnh tối đa 5 MB.' : error.message });
      if (!req.file) return res.status(400).json({ message: 'Vui lòng chọn ảnh trong field image.' });
      const { buffer, mimetype } = req.file;
      const valid = mimetype === 'image/jpeg'
        ? buffer.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]))
        : mimetype === 'image/png'
          ? buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
          : buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP';
      if (!valid) return res.status(400).json({ message: 'Nội dung file không đúng định dạng ảnh.' });
      try {
        await fs.mkdir(directory, { recursive: true });
        const filename = randomUUID() + types[mimetype];
        await fs.writeFile(path.join(directory, filename), buffer, { flag: 'wx' });
        res.json({ path: `/uploads/${folder}/${filename}` });
      } catch (failure) { next(failure); }
    });
  };
};
