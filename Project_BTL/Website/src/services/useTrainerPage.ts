import { useEffect, useRef, useState, type FormEvent } from 'react'
import { searchText } from './catalog'
import { exportCsv, useMemberData } from './members'
import {
  dateKey,
  loadTrainerData,
  ptStatus,
  shiftEnd,
  shiftLocked,
  shiftStart,
  saveTrainer,
  saveTrainerShift,
  bookTrainer,
  updateBooking,
  deleteTrainer,
  deleteTrainerShift,
  type Booking,
  type Shift,
  type Trainer,
} from './trainers'

export type Mode = 'trainers' | 'bookings' | 'roster'
type Editor =
  | { kind: 'trainer'; row?: Trainer }
  | { kind: 'shift'; row?: Shift }
  | { kind: 'book' }
  | { kind: 'action'; action: 'confirm' | 'cancel' | 'complete'; row: Booking }
  | { kind: 'deleteTrainer'; row: Trainer }
  | { kind: 'deleteShift'; row: Shift }

export function useTrainerPage(mode: Mode) {
  const { data, loading, error, reload } = useMemberData(loadTrainerData)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [trainer, setTrainer] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [page, setPage] = useState(1)
  const [editor, setEditor] = useState<Editor | null>(null)
  const [busy, setBusy] = useState(false)
  const busyRef = useRef(false)
  const [formError, setFormError] = useState('')
  const [notice, setNotice] = useState('')
  const [bookingTrainer, setBookingTrainer] = useState('')
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30000)
    return () => window.clearInterval(timer)
  }, [])
  const trainers = data?.trainers || [],
    shifts = data?.shifts || [],
    bookings = data?.bookings || [],
    members = data?.members || []
  const trainerName = (id: number) =>
    trainers.find((t) => Number(t.PTID) === Number(id))?.HoTen || `PT #${id}`
  const member = (id: number) =>
    members.find((m) => Number(m.HoiVienID) === Number(id))
  const bookingShift = (b: Booking) =>
    shifts.find((s) => Number(s.LichPTID) === Number(b.LichPTID))
  const rangeError = !!from && !!to && from > to
  const inRange = (date: string) =>
    !rangeError &&
    (!from || dateKey(date) >= from) &&
    (!to || dateKey(date) <= to)
  const matches = (value: string) =>
    searchText(value).includes(searchText(search))
  const shownTrainers = trainers
    .filter(
      (t) =>
        (!status || t.TrangThai === status) &&
        matches(
          `${t.PTID} ${t.HoTen} ${t.SoDienThoai || ''} ${t.ChuyenMon || ''}`
        )
    )
    .sort((a, b) => b.PTID - a.PTID)
  const shownShifts = shifts
    .filter(
      (s) =>
        (!status || s.TrangThai === status) &&
        (!trainer || Number(s.PTID) === Number(trainer)) &&
        inRange(s.NgayLam) &&
        matches(`${s.LichPTID} ${trainerName(s.PTID)}`)
    )
    .sort((a, b) => shiftStart(b) - shiftStart(a))
  const shownBookings = bookings
    .filter((b) => {
      const s = bookingShift(b)
      return (
        (!status || b.TrangThai === status) &&
        (!trainer || Number(b.PTID) === Number(trainer)) &&
        ((!from && !to) || (s && inRange(s.NgayLam))) &&
        matches(
          `${b.ThuePTID} ${trainerName(b.PTID)} ${member(b.HoiVienID)?.HoTen || ''} ${b.GhiChu || ''}`
        )
      )
    })
    .sort((a, b) => b.ThuePTID - a.ThuePTID)
  const total =
    mode === 'trainers'
      ? shownTrainers.length
      : mode === 'roster'
        ? shownShifts.length
        : shownBookings.length
  const currentPage = Math.min(page, Math.max(1, Math.ceil(total / 10)))
  const slice = <T>(rows: T[]) =>
    rows.slice((currentPage - 1) * 10, currentPage * 10)
  const statuses =
    mode === 'trainers'
      ? ['ACTIVE', 'INACTIVE']
      : mode === 'roster'
        ? ['AVAILABLE', 'BOOKED', 'OFF']
        : ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED']
  const title =
    mode === 'trainers'
      ? 'Danh sách huấn luyện viên'
      : mode === 'bookings'
        ? 'Lịch thuê PT'
        : 'Lịch làm việc & phân ca'
  const open = (value: Editor) => {
    setFormError('')
    setBookingTrainer('')
    setEditor(value)
  }
  const close = () => {
    if (!busyRef.current) setEditor(null)
  }
  async function submit(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault()
    if (!editor || !data || busyRef.current) return
    const form = event ? new FormData(event.currentTarget) : null
    busyRef.current = true
    setBusy(true)
    setFormError('')
    setNotice('')
    try {
      if (editor.kind === 'trainer' && form) {
        await saveTrainer(form, editor.row?.PTID)
      } else if (editor.kind === 'shift' && form) {
        await saveTrainerShift(form, editor.row)
      } else if (editor.kind === 'book' && form) {
        await bookTrainer(form)
      } else if (editor.kind === 'action') {
        await updateBooking(
          editor.row,
          editor.action,
          member(editor.row.HoiVienID)?.TaiKhoanID
        )
      } else if (editor.kind === 'deleteTrainer') {
        await deleteTrainer(editor.row.PTID)
      } else if (editor.kind === 'deleteShift') {
        await deleteTrainerShift(editor.row.LichPTID)
      }
      setEditor(null)
      setNotice('Đã lưu thay đổi thành công.')
      reload()
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Không thể xử lý yêu cầu.')
    } finally {
      busyRef.current = false
      setBusy(false)
    }
  }
  function download() {
    const rows =
      mode === 'trainers'
        ? [
            [
              'Mã PT',
              'Họ tên',
              'Điện thoại',
              'Email',
              'Chuyên môn',
              'Giá thuê',
              'Trạng thái',
            ],
            ...shownTrainers.map((t) => [
              t.PTID,
              t.HoTen,
              t.SoDienThoai || '',
              t.Email || '',
              t.ChuyenMon || '',
              t.GiaThue,
              ptStatus(t.TrangThai),
            ]),
          ]
        : mode === 'roster'
          ? [
              [
                'Mã ca',
                'Huấn luyện viên',
                'Ngày',
                'Bắt đầu',
                'Kết thúc',
                'Trạng thái',
              ],
              ...shownShifts.map((s) => [
                s.LichPTID,
                trainerName(s.PTID),
                dateKey(s.NgayLam),
                s.GioBatDau,
                s.GioKetThuc,
                ptStatus(s.TrangThai),
              ]),
            ]
          : [
              [
                'Mã thuê',
                'Hội viên',
                'Huấn luyện viên',
                'Ngày tập',
                'Giá thuê',
                'Trạng thái',
              ],
              ...shownBookings.map((b) => [
                b.ThuePTID,
                member(b.HoiVienID)?.HoTen || b.HoiVienID,
                trainerName(b.PTID),
                dateKey(bookingShift(b)?.NgayLam || ''),
                b.GiaThue,
                ptStatus(b.TrangThai),
              ]),
            ]
    exportCsv(`${mode}.csv`, rows)
  }
  const currentTrainer = editor?.kind === 'trainer' ? editor.row : undefined
  const currentShift = editor?.kind === 'shift' ? editor.row : undefined
  const available = shifts
    .filter(
      (s) =>
        s.TrangThai === 'AVAILABLE' &&
        shiftStart(s) > now &&
        trainers.some(
          (t) => Number(t.PTID) === Number(s.PTID) && t.TrangThai === 'ACTIVE'
        ) &&
        (!bookingTrainer || Number(s.PTID) === Number(bookingTrainer))
    )
    .sort((a, b) => shiftStart(a) - shiftStart(b))
  const changeSearch = (value: string) => {
    setSearch(value)
    setPage(1)
  }
  const changeStatus = (value: string) => {
    setStatus(value)
    setPage(1)
  }
  const changeTrainer = (value: string) => {
    setTrainer(value)
    setPage(1)
  }
  const changeFrom = (value: string) => {
    setFrom(value)
    setPage(1)
  }
  const changeTo = (value: string) => {
    setTo(value)
    setPage(1)
  }
  const resetFilters = () => {
    setSearch('')
    setStatus('')
    setTrainer('')
    setFrom('')
    setTo('')
    setPage(1)
  }
  const stats = statuses.map((status) => ({
    status,
    count: (mode === 'trainers'
      ? trainers
      : mode === 'roster'
        ? shifts
        : bookings
    ).filter((r) => r.TrangThai === status).length,
  }))
  const visibleTrainers = slice(shownTrainers)
  const visibleShifts = slice(shownShifts)
  const visibleBookings = slice(shownBookings)
  const activeTrainers = trainers.filter((t) => t.TrangThai === 'ACTIVE')
  const activeMembers = members.filter(
    (m) => m.TrangThai === 'ACTIVE' && m.TaiKhoanID
  )
  const today = dateKey(new Date().toISOString())
  const trainerPrice = (id: number) =>
    Number(trainers.find((t) => Number(t.PTID) === Number(id))?.GiaThue || 0)
  const trainerHasSchedule = (t: Trainer) =>
    shifts.some((s) => Number(s.PTID) === Number(t.PTID)) ||
    bookings.some((b) => Number(b.PTID) === Number(t.PTID))
  const isShiftLocked = (s: Shift) => shiftLocked(s, bookings)
  const canEditShift = (s: Shift) =>
    !(shiftLocked(s, bookings) || shiftStart(s) <= now)
  const bookingView = (b: Booking) => {
    const shift = bookingShift(b)
    return {
      shift,
      canConfirm: b.TrangThai === 'PENDING',
      showCancel:
        ['PENDING', 'CONFIRMED'].includes(b.TrangThai) &&
        !!shift &&
        shiftStart(shift) > now,
      canCancel: !!member(b.HoiVienID)?.TaiKhoanID,
      canComplete:
        b.TrangThai === 'CONFIRMED' && !!shift && shiftEnd(shift) <= now,
    }
  }
  return {
    changeSearch,
    changeStatus,
    changeTrainer,
    changeFrom,
    changeTo,
    resetFilters,
    stats,
    visibleTrainers,
    visibleShifts,
    visibleBookings,
    activeTrainers,
    activeMembers,
    today,
    trainerPrice,
    trainerHasSchedule,
    isShiftLocked,
    canEditShift,
    bookingView,
    data,
    loading,
    error,
    reload,
    search,
    status,
    trainer,
    from,
    to,
    setPage,
    editor,
    busy,
    formError,
    notice,
    bookingTrainer,
    setBookingTrainer,
    trainers,
    trainerName,
    member,
    rangeError,
    total,
    currentPage,
    statuses,
    title,
    open,
    close,
    submit,
    download,
    currentTrainer,
    currentShift,
    available,
  }
}
