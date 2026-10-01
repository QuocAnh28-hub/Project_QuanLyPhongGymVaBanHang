const bcrypt = require('bcryptjs');

const isHash = value => /^\$2[aby]\$\d{2}\$/.test(String(value));
const hashPassword = password => bcrypt.hash(password, 12);
const verifyPassword = (password, stored) => isHash(stored)
  ? bcrypt.compare(password, stored)
  : Promise.resolve(String(password) === String(stored));

module.exports = { hashPassword, verifyPassword, isHash };
