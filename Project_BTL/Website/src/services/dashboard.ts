import { dashboardDate, type DashboardData } from '../data/dashboard'
import { catalogRequest } from './catalog'
import { loadTrainerData } from './trainers'

export async function loadDashboard(signal: AbortSignal): Promise<DashboardData> {
  const today = dashboardDate(new Date())
  const from = `${today.slice(0, 8)}01`
  const [report, checkins, trainers, orders] = await Promise.all([
    catalogRequest<DashboardData['report']>(`reports/admin?from=${from}&to=${today}`, { signal }),
    catalogRequest<DashboardData['checkins']>('checkin/admin/today', { signal }),
    loadTrainerData(signal),
    catalogRequest<DashboardData['orders']>('donhang', { signal }),
  ])
  if (!report.revenue || !report.members || !Array.isArray(report.revenueByDay)
    || !checkins.metrics || !Array.isArray(checkins.rows) || !Array.isArray(orders)) {
    throw new Error('Dữ liệu Dashboard trả về không hợp lệ.')
  }
  // Retry across midnight so the report range and today's lists stay aligned.
  if (dashboardDate(new Date()) !== today) return loadDashboard(signal)
  return { report, checkins, trainers, orders, today, updatedAt: new Date().toISOString() }
}
