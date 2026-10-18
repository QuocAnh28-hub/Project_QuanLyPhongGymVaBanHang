import type { Report } from '../services/admin-finance'
import type { CheckInRow } from '../services/checkins'
import type { Order } from '../services/orders'
import type { TrainerData } from '../services/trainers'

export const dashboardTimeZone = 'Asia/Ho_Chi_Minh'

// SQL DATETIME values have no offset; the gym operates in Vietnam time.
export function dashboardTimestamp(value: string) {
  return new Date(/^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}(:\d{2}(\.\d+)?)?$/.test(value)
    ? `${value.replace(' ', 'T')}+07:00`
    : value).getTime()
}

export function dashboardDate(value: string | Date) {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value
  const date = typeof value === 'string' ? new Date(dashboardTimestamp(value)) : value
  if (!Number.isFinite(date.getTime())) return ''
  const parts = new Intl.DateTimeFormat('en', {
    timeZone: dashboardTimeZone, year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(date)
  const part = (type: string) => parts.find((p) => p.type === type)?.value
  return `${part('year')}-${part('month')}-${part('day')}`
}

export type DashboardData = {
  report: Report
  checkins: {
    metrics: { total: number; present: number; checkedOut: number }
    rows: CheckInRow[]
  }
  trainers: TrainerData
  orders: Order[]
  today: string
  updatedAt: string
}

export function summarizeDashboard(data: DashboardData) {
  const { report, checkins, trainers, orders, today } = data
  const hours = Array.from({ length: 24 }, (_, hour) => ({ hour, count: 0 }))
  for (const row of checkins.rows) {
    if (dashboardDate(row.ThoiGianCheckIn) !== today) continue
    const hour = Number(new Intl.DateTimeFormat('en-GB', {
      timeZone: dashboardTimeZone, hour: '2-digit', hourCycle: 'h23',
    }).format(new Date(dashboardTimestamp(row.ThoiGianCheckIn))))
    hours[hour].count++
  }
  const amounts = new Map<string, number>()
  for (const row of report.revenueByDay) {
    const day = dashboardDate(row.date)
    amounts.set(day, (amounts.get(day) || 0) + Number(row.amount || 0))
  }
  const revenueDays = Array.from({ length: Number(today.slice(8)) }, (_, i) => {
    const date = `${today.slice(0, 8)}${String(i + 1).padStart(2, '0')}`
    return { date, amount: amounts.get(date) || 0 }
  })
  const members = new Map(trainers.members.map((m) => [Number(m.HoiVienID), m.HoTen]))
  const coaches = new Map(trainers.trainers.map((t) => [Number(t.PTID), t.HoTen]))
  const shifts = new Map(trainers.shifts.map((s) => [Number(s.LichPTID), s]))
  const sessions = trainers.bookings.flatMap((booking) => {
    const shift = shifts.get(Number(booking.LichPTID))
    if (!shift || dashboardDate(shift.NgayLam) !== today) return []
    return [{
      ...booking,
      start: shift.GioBatDau.slice(0, 5),
      startAt: dashboardTimestamp(`${today}T${shift.GioBatDau}`),
      trainer: coaches.get(Number(booking.PTID)) || `HLV #${booking.PTID}`,
      member: members.get(Number(booking.HoiVienID)) || `Hội viên #${booking.HoiVienID}`,
    }]
  }).sort((a, b) => a.startAt - b.startAt || a.ThuePTID - b.ThuePTID)
  const upcoming = sessions.filter((s) =>
    ['PENDING', 'CONFIRMED'].includes(s.TrangThai) && s.startAt >= dashboardTimestamp(data.updatedAt))
  const todayOrders = orders.filter((o) => dashboardDate(o.NgayDat) === today)
  const pendingOrders = orders.filter((o) => ['PENDING', 'CONFIRMED', 'PROCESSING'].includes(o.TrangThai))
    .sort((a, b) => dashboardTimestamp(a.NgayDat) - dashboardTimestamp(b.NgayDat) || a.DonHangID - b.DonHangID)
  return {
    hours, revenueDays, sessions, upcoming, todayOrders, pendingOrders,
    activeTrainers: trainers.trainers.filter((t) => t.TrangThai === 'ACTIVE').length,
    latestCheckins: [...checkins.rows].sort((a, b) =>
      dashboardTimestamp(b.ThoiGianCheckIn) - dashboardTimestamp(a.ThoiGianCheckIn) || b.CheckInID - a.CheckInID).slice(0, 6),
  }
}
