// NAPAS VietQR account transfer payload. Render locally; no bank success is inferred.
const field = (tag, value) => {
  if (!/^[\x20-\x7e]*$/.test(value) || value.length > 99) throw new Error('Invalid VietQR field');
  return tag + String(value.length).padStart(2, '0') + value;
};
function crc16(value) {
  let crc = 0xffff;
  for (const byte of Buffer.from(value, 'ascii')) {
    crc ^= byte << 8;
    for (let bit=0; bit<8; bit++) crc = ((crc << 1) ^ (crc & 0x8000 ? 0x1021 : 0)) & 0xffff;
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}
function transferInfo(order) {
  const bankBin = process.env.SHOP_BANK_BIN || '';
  const accountNo = process.env.SHOP_BANK_ACCOUNT || '';
  const accountName = process.env.SHOP_BANK_NAME || '';
  const content = `QAGYM DH${order.DonHangID} TT${order.ThanhToanID}`;
  const amount = String(order.TongTien).replace(/\.00$/, '');
  if (!/^\d{6}$/.test(bankBin) || !/^\d{4,30}$/.test(accountNo) || !/^\d+(?:\.\d{1,2})?$/.test(amount) || Number(amount)<=0) return null;
  const bank = field('00',bankBin) + field('01',accountNo);
  const provider = field('00','A000000727') + field('01',bank) + field('02','QRIBFTTA');
  const data = field('00','01') + field('01','12') + field('38',provider) + field('53','704')
    + field('54',amount) + field('58','VN') + field('62',field('08',content)) + '6304';
  return { bankBin, accountNo, accountName, amount, content, qrPayload: data + crc16(data) };
}
module.exports = { transferInfo, crc16 };
