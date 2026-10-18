import assert from 'node:assert/strict'
import { matchesCheckIn } from '../src/services/checkin-search.ts'

const row = { HoiVienID: 62, HoTen: 'Đỗ Minh Huy', SoDienThoai: '0897003049' }
for (const query of ['', '  ', 'do huy', 'Đỗ Minh', 'HV-62', 'HV000062', '62', '0897003049', 'huy 03049']) {
  assert(matchesCheckIn(row, query), `Should match ${query}`)
}
for (const query of ['HV-6', 'minh anh', 'huy 99999']) {
  assert(!matchesCheckIn(row, query), `Should not match ${query}`)
}
assert(!matchesCheckIn({ ...row, SoDienThoai: null }, '0897'))
console.log('Check-in search checks passed')
