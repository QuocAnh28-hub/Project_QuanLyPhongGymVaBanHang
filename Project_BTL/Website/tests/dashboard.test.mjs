import assert from 'node:assert/strict'
import test from 'node:test'
import { dashboardDate, dashboardTimestamp, summarizeDashboard } from '../src/data/dashboard.ts'

const emptyData = () => ({
  today: '2026-10-03',
  updatedAt: '2026-10-03T03:00:00Z',
  report: { revenueByDay: [] },
  checkins: { rows: [], metrics: { total: 0, present: 0, checkedOut: 0 } },
  trainers: { members: [], trainers: [], shifts: [], bookings: [] },
  orders: [],
})

test('Vietnam calendar dates agree for SQL timestamps, UTC timestamps and date-only values', () => {
  assert.equal(dashboardDate('2026-09-30T17:30:00Z'), '2026-10-01')
  assert.equal(dashboardDate('2026-10-01 00:30:00'), '2026-10-01')
  assert.equal(dashboardDate('2026-10-01'), '2026-10-01')
  assert.equal(dashboardTimestamp('2026-10-01 00:30:00'), Date.parse('2026-09-30T17:30:00Z'))
})

test('empty database produces real zero values, all hours, and no future revenue dates', () => {
  const summary = summarizeDashboard(emptyData())
  assert.equal(summary.hours.length, 24)
  assert.equal(summary.hours.reduce((sum, h) => sum + h.count, 0), 0)
  assert.deepEqual(summary.revenueDays, [
    { date: '2026-10-01', amount: 0 },
    { date: '2026-10-02', amount: 0 },
    { date: '2026-10-03', amount: 0 },
  ])
  assert.equal(summary.activeTrainers, 0)
  assert.deepEqual(summary.upcoming, [])
  assert.deepEqual(summary.pendingOrders, [])
})

test('daily revenue accepts SQL decimals and fills missing days without inventing revenue', () => {
  const data = emptyData()
  data.report.revenueByDay = [
    { date: '2026-09-30T17:00:00Z', amount: '125000.50' },
    { date: '2026-10-03', amount: '200000' },
  ]
  const result = summarizeDashboard(data).revenueDays
  assert.deepEqual(result.map((d) => d.amount), [125000.5, 0, 200000])
})

test('PT sessions use shift date, exclude past/cancelled sessions from upcoming, and resolve names', () => {
  const data = emptyData()
  data.trainers.members = [{ HoiVienID: 1, HoTen: 'Member' }]
  data.trainers.trainers = [{ PTID: 2, HoTen: 'Coach', TrangThai: 'ACTIVE' }]
  data.trainers.shifts = [
    { LichPTID: 1, NgayLam: '2026-10-03', GioBatDau: '09:00:00' },
    { LichPTID: 2, NgayLam: '2026-10-02T17:00:00Z', GioBatDau: '11:00:00' },
    { LichPTID: 3, NgayLam: '2026-10-04', GioBatDau: '12:00:00' },
    { LichPTID: 4, NgayLam: '2026-10-03', GioBatDau: '14:00:00' },
  ]
  data.trainers.bookings = [1, 2, 3, 4].map((id) => ({
    ThuePTID: id, LichPTID: id, PTID: 2, HoiVienID: 1,
    NgayDat: '2026-09-20', TrangThai: id === 4 ? 'CANCELLED' : 'CONFIRMED',
  }))
  const summary = summarizeDashboard(data)
  assert.equal(summary.sessions.length, 3)
  assert.deepEqual(summary.upcoming.map((s) => s.ThuePTID), [2])
  assert.equal(summary.upcoming[0].member, 'Member')
  assert.equal(summary.upcoming[0].trainer, 'Coach')
})

test('check-in histogram includes midnight and late hours, with latest activity sorted', () => {
  const data = emptyData()
  data.checkins.rows = [
    { CheckInID: 1, ThoiGianCheckIn: '2026-10-03 00:00:00' },
    { CheckInID: 2, ThoiGianCheckIn: '2026-10-03 23:45:00' },
    { CheckInID: 3, ThoiGianCheckIn: '2026-10-02T17:30:00Z' },
  ]
  const summary = summarizeDashboard(data)
  assert.equal(summary.hours[0].count, 2)
  assert.equal(summary.hours[23].count, 1)
  assert.deepEqual(summary.latestCheckins.map((r) => r.CheckInID), [2, 3, 1])
})

test('order backlog includes older orders but excludes completed/cancelled ones', () => {
  const data = emptyData()
  data.orders = [
    { DonHangID: 1, NgayDat: '2026-10-03 12:00:00', TrangThai: 'PENDING' },
    { DonHangID: 2, NgayDat: '2026-09-20 09:00:00', TrangThai: 'PROCESSING' },
    { DonHangID: 3, NgayDat: '2026-10-03 08:00:00', TrangThai: 'COMPLETED' },
    { DonHangID: 4, NgayDat: '2026-10-03 07:00:00', TrangThai: 'CANCELLED' },
  ]
  const summary = summarizeDashboard(data)
  assert.equal(summary.todayOrders.length, 3)
  assert.deepEqual(summary.pendingOrders.map((o) => o.DonHangID), [2, 1])
})
