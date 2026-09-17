import assert from 'node:assert/strict';
import { addCalendarMonths, diamondDurations, formatVND, periodLabel } from '../src/lib/package-logic.ts';

assert.deepEqual(diamondDurations.map(x => [x.months, x.monthlyPrice, x.totalPrice, x.months + x.bonusMonths]), [
  [3, 1590000, 4770000, 3], [6, 1420000, 8520000, 6], [12, 915833, 10990000, 14],
]);
assert.equal(formatVND(15480000), '15.480.000₫');
assert.equal(periodLabel(diamondDurations[2]), 'Gói 12 tháng + 2 tháng tặng');
assert.equal(addCalendarMonths(new Date(2025, 0, 31), 1).getDate(), 28);
assert.equal(addCalendarMonths(new Date(2024, 0, 31), 1).getDate(), 29);
console.log('Package price and calendar checks passed');
