import type { ApiCheckInRecord } from './check-in-api';

export const isCompleted = (row: ApiCheckInRecord) =>
  row.TrangThai === 'CHECKED_OUT' && !!row.ThoiGianCheckOut;

export const sessionDate = (value: string) => new Date(value.replace(' ', 'T'));
export function sessionsInMonth(rows: ApiCheckInRecord[], month: Date | null) {
  if (!month) return rows;
  return rows.filter(row => {
    const date = sessionDate(row.ThoiGianCheckIn);
    return date.getFullYear() === month.getFullYear() && date.getMonth() === month.getMonth();
  });
}
export function sessionDay(value: string) {
  const date = sessionDate(value);
  if (!Number.isFinite(date.getTime())) return null;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
export function recordDurationMinutes(row: ApiCheckInRecord) {
  if (!isCompleted(row)) return 0;
  const minutes = Math.floor((sessionDate(row.ThoiGianCheckOut!).getTime() - sessionDate(row.ThoiGianCheckIn).getTime()) / 60000);
  return Number.isFinite(minutes) ? Math.max(0, minutes) : 0;
}
export function summarizeCheckInHistory(rows: ApiCheckInRecord[]) {
  const completed = rows.filter(isCompleted);
  const days = [...new Set(completed.map(row => sessionDay(row.ThoiGianCheckIn)).filter((day): day is string => day !== null))].sort();
  let streak = 0, current = 0, previous = -Infinity;
  for (const day of days) {
    const ordinal = Date.parse(`${day}T00:00:00Z`) / 86400000;
    current = ordinal === previous + 1 ? current + 1 : 1;
    streak = Math.max(streak, current);
    previous = ordinal;
  }
  return {
    totalSessions: completed.length,
    totalDurationMinutes: completed.reduce((sum, row) => sum + recordDurationMinutes(row), 0),
    streak,
    attendanceByDay: days,
    activeSessions: rows.filter(row => row.TrangThai === 'CHECKED_IN' && !row.ThoiGianCheckOut).length,
  };
}
