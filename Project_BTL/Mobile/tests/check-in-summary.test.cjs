const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

const code = ts.transpileModule(fs.readFileSync(path.join(__dirname, '../src/lib/check-in-summary.ts'), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText;
const context = { exports: {} };
vm.runInNewContext(code, context);
const { summarizeCheckInHistory, recordDurationMinutes, isCompleted, sessionsInMonth } = context.exports;
const record = (start, end = null, status = end ? 'CHECKED_OUT' : 'CHECKED_IN') => ({
  CheckInID: 1, HoiVienID: 8, ThoiGianCheckIn: start, ThoiGianCheckOut: end, TrangThai: status,
});

test('check-in contributes no completed session, duration or streak; checkout contributes one', () => {
  const active = record('2026-10-07 10:00:00');
  const before = summarizeCheckInHistory([active]);
  assert.equal(before.totalSessions, 0);
  assert.equal(before.totalDurationMinutes, 0);
  assert.equal(before.streak, 0);
  assert.equal(before.activeSessions, 1);
  const completed = record(active.ThoiGianCheckIn, '2026-10-07 11:30:00');
  const after = summarizeCheckInHistory([completed]);
  assert.equal(after.totalSessions, 1);
  assert.equal(after.totalDurationMinutes, 90);
  assert.equal(after.streak, 1);
  assert.equal(after.activeSessions, 0);
});

test('two sessions on one day count twice but only one streak day', () => {
  const summary = summarizeCheckInHistory([
    record('2026-10-07 10:00:00', '2026-10-07 11:00:00'),
    record('2026-10-07 18:00:00', '2026-10-07 18:45:00'),
    record('2026-10-08 10:00:00'),
  ]);
  assert.equal(summary.totalSessions, 2);
  assert.equal(summary.totalDurationMinutes, 105);
  assert.equal(summary.streak, 1);
  assert.deepEqual(Array.from(summary.attendanceByDay), ['2026-10-07']);
});

test('streak uses full dates across month/year boundaries and excludes active days', () => {
  const summary = summarizeCheckInHistory([
    record('2026-12-31 10:00:00', '2026-12-31 11:00:00'),
    record('2027-01-01 10:00:00', '2027-01-01 11:00:00'),
    record('2027-01-02 10:00:00'),
    record('2027-01-03 10:00:00', '2027-01-03 11:00:00'),
    record('2027-02-01 10:00:00', '2027-02-01 11:00:00'),
  ]);
  assert.equal(summary.streak, 2);
  assert.equal(summary.attendanceByDay.length, 4);
});

test('status and exit timestamp are both required; malformed duration does not poison totals', () => {
  for (const row of [record('2026-10-07 10:00:00', null, 'CHECKED_OUT'), record('2026-10-07 10:00:00', '2026-10-07 11:00:00', 'CHECKED_IN')]) {
    assert.equal(isCompleted(row), false);
    assert.equal(recordDurationMinutes(row), 0);
    assert.equal(summarizeCheckInHistory([row]).totalSessions, 0);
  }
  assert.equal(recordDurationMinutes(record('invalid', 'invalid')), 0);
  assert.equal(recordDurationMinutes(record('2026-10-07T10:00:00Z', '2026-10-07T11:30:00Z')), 90);
});

test('Profile lifetime count equals History All; each month summarizes only its completed sessions', () => {
  const history = [
    record('2026-09-30 10:00:00', '2026-09-30 11:00:00'),
    record('2026-10-01 10:00:00', '2026-10-01 11:00:00'),
    record('2026-10-07 18:00:00', '2026-10-07 18:45:00'),
    record('2026-10-07 19:00:00'),
    record('2026-10-06 10:00:00', null, 'CHECKED_OUT'),
  ];
  const profileCount = history.filter(isCompleted).length;
  assert.equal(profileCount, 3);
  assert.equal(summarizeCheckInHistory(sessionsInMonth(history, null)).totalSessions, profileCount);
  const currentRows = sessionsInMonth(history, new Date(2026, 9, 1));
  assert.equal(currentRows.length, 4); // In-progress/incomplete records remain visible.
  const current = summarizeCheckInHistory(currentRows);
  assert.equal(current.totalSessions, 2);
  assert.equal(current.totalDurationMinutes, 105);
  assert.equal(current.attendanceByDay.length, 2);
  const previous = summarizeCheckInHistory(sessionsInMonth(history, new Date(2026, 8, 1)));
  assert.equal(previous.totalSessions, 1);
  assert.equal(previous.totalDurationMinutes, 60);
});
