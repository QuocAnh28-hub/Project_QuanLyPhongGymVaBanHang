import type { CheckInRow } from './checkins'

const normalize = (value: string) => value.normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '').replace(/đ/gi, 'd').toLowerCase()

export function matchesCheckIn(row: CheckInRow, search: string) {
  const terms = normalize(search).trim().split(/\s+/).filter(Boolean)
  const name = normalize(row.HoTen)
  const phone = (row.SoDienThoai || '').replace(/\D/g, '')
  return terms.every(term => {
    const memberCode = term.match(/^(?:hv[- ]?)?0*(\d+)$/)
    return name.includes(term) || phone.includes(term) ||
      (!!memberCode && Number(memberCode[1]) === row.HoiVienID)
  })
}
