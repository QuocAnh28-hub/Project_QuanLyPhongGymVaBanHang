import { catalogRequest } from './catalog'
import type { Member } from './members'

export type Trainer = {
  PTID: number; HoTen: string; NgaySinh: string | null; GioiTinh: string | null
  SoDienThoai: string | null; Email: string | null; ChuyenMon: string | null
  KinhNghiem: string | null; GiaThue: number | string; AnhDaiDien: string | null; TrangThai: string
}
export type Shift = { LichPTID: number; PTID: number; NgayLam: string; GioBatDau: string; GioKetThuc: string; TrangThai: string }
export type Booking = { ThuePTID: number; HoiVienID: number; PTID: number; LichPTID: number; NgayDat: string; GiaThue: number | string; TrangThai: string; GhiChu: string | null }
export type TrainerData = { trainers: Trainer[]; shifts: Shift[]; bookings: Booking[]; members: Member[] }
export async function loadTrainerData(signal: AbortSignal): Promise<TrainerData> {
  const [trainers, shifts, bookings, members] = await Promise.all([
    catalogRequest<Trainer[]>('pt', { signal }), catalogRequest<Shift[]>('lichpt', { signal }),
    catalogRequest<Booking[]>('thuept', { signal }), catalogRequest<Member[]>('hoivien', { signal }),
  ])
  if (![trainers, shifts, bookings, members].every(Array.isArray)) throw new Error('Dữ liệu máy chủ không hợp lệ.')
  return { trainers, shifts, bookings, members }
}
export const ptStatus = (value: string) => ({ ACTIVE: 'Đang hoạt động', INACTIVE: 'Ngừng hoạt động', AVAILABLE: 'Còn trống', BOOKED: 'Đã đặt', OFF: 'Nghỉ', PENDING: 'Chờ xác nhận', CONFIRMED: 'Đã xác nhận', COMPLETED: 'Hoàn thành', CANCELLED: 'Đã hủy' }[value] || value)
export function dateKey(value: string | null) {
  if (!value) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}
export const shiftStart = (shift: Shift) => new Date(`${dateKey(shift.NgayLam)}T${shift.GioBatDau}`).getTime()
export const shiftEnd = (shift: Shift) => new Date(`${dateKey(shift.NgayLam)}T${shift.GioKetThuc}`).getTime()
export const shiftLocked = (shift: Shift, bookings: Booking[]) => shift.TrangThai === 'BOOKED' || bookings.some(b => Number(b.LichPTID) === Number(shift.LichPTID))
const validDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(new Date(`${value}T00:00:00`).getTime()) && dateKey(`${value}T00:00:00`) === value

export function trainerPayload(form: FormData) {
  const text = (key: string) => String(form.get(key) || '').trim()
  const HoTen = text('HoTen'), GiaThue = Number(text('GiaThue'))
  if (!HoTen || HoTen.length > 100) throw new Error('Họ tên phải từ 1 đến 100 ký tự.')
  if (!text('GiaThue') || !Number.isFinite(GiaThue) || GiaThue < 0 || GiaThue > 9999999999999.99 || Math.abs(GiaThue * 100 - Math.round(GiaThue * 100)) > .01) throw new Error('Giá thuê không hợp lệ hoặc có quá 2 chữ số thập phân.')
  if (text('SoDienThoai') && !/^\+?[\d\s()-]{8,20}$/.test(text('SoDienThoai'))) throw new Error('Số điện thoại không hợp lệ.')
  if (text('Email') && (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text('Email')) || text('Email').length > 100)) throw new Error('Email không hợp lệ.')
  if (text('AnhDaiDien') && (!/^https?:\/\//i.test(text('AnhDaiDien')) || text('AnhDaiDien').length > 255)) throw new Error('Ảnh phải là URL HTTP/HTTPS, tối đa 255 ký tự.')
  if (!['ACTIVE', 'INACTIVE'].includes(text('TrangThai'))) throw new Error('Trạng thái không hợp lệ.')
  if (text('GioiTinh') && !['NAM', 'NU', 'KHAC'].includes(text('GioiTinh'))) throw new Error('Giới tính không hợp lệ.')
  if (text('ChuyenMon').length > 255) throw new Error('Chuyên môn tối đa 255 ký tự.')
  if (text('NgaySinh') && (!validDate(text('NgaySinh')) || text('NgaySinh') > dateKey(new Date().toISOString()))) throw new Error('Ngày sinh không hợp lệ.')
  return { HoTen, GiaThue, NgaySinh: text('NgaySinh') || null, GioiTinh: text('GioiTinh') || null, SoDienThoai: text('SoDienThoai') || null, Email: text('Email') || null, ChuyenMon: text('ChuyenMon') || null, KinhNghiem: text('KinhNghiem') || null, AnhDaiDien: text('AnhDaiDien') || null, TrangThai: text('TrangThai') }
}
export function shiftPayload(form: FormData, data: TrainerData, editing?: Shift) {
  const text = (key: string) => String(form.get(key) || '').trim()
  const PTID = Number(text('PTID')), NgayLam = text('NgayLam'), GioBatDau = text('GioBatDau'), GioKetThuc = text('GioKetThuc'), TrangThai = text('TrangThai')
  if (!data.trainers.some(t => Number(t.PTID) === PTID && t.TrangThai === 'ACTIVE')) throw new Error('Vui lòng chọn huấn luyện viên đang hoạt động.')
  if (!validDate(NgayLam) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(GioBatDau) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(GioKetThuc) || GioKetThuc <= GioBatDau) throw new Error('Ngày giờ không hợp lệ; giờ kết thúc phải sau giờ bắt đầu trong cùng ngày.')
  if (!['AVAILABLE', 'OFF'].includes(TrangThai)) throw new Error('Trạng thái ca không hợp lệ.')
  if (editing && shiftLocked(editing, data.bookings)) throw new Error('Ca đã có lịch thuê, không thể sửa để tránh thay đổi lịch sử.')
  const start = new Date(`${NgayLam}T${GioBatDau}`).getTime()
  if (!Number.isFinite(start) || start <= Date.now()) throw new Error('Ca làm việc phải bắt đầu trong tương lai.')
  if (data.shifts.some(s => Number(s.PTID) === PTID && s.LichPTID !== editing?.LichPTID && dateKey(s.NgayLam) === NgayLam && GioBatDau < s.GioKetThuc.slice(0, 5) && GioKetThuc > s.GioBatDau.slice(0, 5))) throw new Error('Huấn luyện viên đã có ca trùng khung giờ này.')
  return { PTID, NgayLam, GioBatDau, GioKetThuc, TrangThai }
}

export function saveTrainer(form: FormData, id?: number) {
  return catalogRequest(id === undefined ? 'pt' : `pt/${id}`, { method: id === undefined ? 'POST' : 'PUT', body: JSON.stringify(trainerPayload(form)) })
}

export async function saveTrainerShift(form: FormData, editing?: Shift) {
  const fresh = await loadTrainerData(new AbortController().signal)
  const current = editing ? fresh.shifts.find(s => Number(s.LichPTID) === Number(editing?.LichPTID)) : undefined
  if (editing && !current) throw new Error('Ca không còn tồn tại. Vui lòng làm mới danh sách.')
  await catalogRequest(`lichpt${current ? `/${current.LichPTID}` : ''}`, { method: current ? 'PUT' : 'POST', body: JSON.stringify(shiftPayload(form, fresh, current)) })
}

export async function bookTrainer(form: FormData) {
  const TaiKhoanID = Number(form.get('TaiKhoanID')), LichPTID = Number(form.get('LichPTID'))
  if (!TaiKhoanID || !LichPTID) throw new Error('Vui lòng chọn hội viên và ca làm việc.')
  await catalogRequest('thuept/book', { method: 'POST', body: JSON.stringify({ TaiKhoanID, LichPTID, GhiChu: String(form.get('GhiChu') || '').trim() || null }) })
}

export async function updateBooking(b: Booking, action: 'confirm' | 'cancel' | 'complete', accountId?: number | null) {
  if (action === 'complete') {
    const fresh = await catalogRequest<Booking>(`thuept/${b.ThuePTID}`)
    const s = await catalogRequest<Shift>(`lichpt/${fresh.LichPTID}`)
    if (fresh.TrangThai !== 'CONFIRMED' || shiftEnd(s) > Date.now()) throw new Error('Chỉ hoàn thành lịch đã xác nhận và đã kết thúc.')
    await catalogRequest(`thuept/${b.ThuePTID}`, { method: 'PUT', body: JSON.stringify({ TrangThai: 'COMPLETED' }) })
  } else {
    const TaiKhoanID = accountId
    if (action === 'cancel' && !TaiKhoanID) throw new Error('Hội viên chưa có tài khoản liên kết.')
    await catalogRequest(`thuept/${b.ThuePTID}/${action}`, { method: 'POST', body: JSON.stringify(action === 'cancel' ? { TaiKhoanID } : {}) })
  }
}

export async function deleteTrainer(id: number) {
  const fresh = await loadTrainerData(new AbortController().signal)
  if (fresh.shifts.some(s => Number(s.PTID) === Number(id)) || fresh.bookings.some(b => Number(b.PTID) === Number(id))) throw new Error('Huấn luyện viên đã có lịch. Hãy chuyển sang ngừng hoạt động thay vì xóa.')
  await catalogRequest(`pt/${id}`, { method: 'DELETE' })
}

export async function deleteTrainerShift(id: number) {
  const fresh = await loadTrainerData(new AbortController().signal)
  const s = fresh.shifts.find(s => Number(s.LichPTID) === Number(id))
  if (!s || shiftLocked(s, fresh.bookings)) throw new Error('Ca đã có lịch thuê hoặc không còn tồn tại, không thể xóa.')
  await catalogRequest(`lichpt/${s.LichPTID}`, { method: 'DELETE' })
}
