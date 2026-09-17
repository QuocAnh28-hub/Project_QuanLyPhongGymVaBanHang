import assert from 'node:assert/strict';
import { addCalendarMonths, calculatePrice, diamondDurations, findVoucher, formatVND, parseLocalDate, periodLabel } from '../src/lib/package-logic.ts';

assert.deepEqual(diamondDurations.map(x => [x.months, x.monthlyPrice, x.totalPrice, x.months + x.bonusMonths]), [
  [3, 1590000, 4770000, 3], [6, 1420000, 8520000, 6], [12, 915833, 10990000, 14],
]);
assert.equal(formatVND(15480000), '15.480.000₫');
assert.equal(periodLabel(diamondDurations[2]), 'Gói 12 tháng + 2 tháng tặng');
assert.equal(addCalendarMonths(new Date(2025, 0, 31), 1).getDate(), 28);
assert.equal(addCalendarMonths(new Date(2024, 0, 31), 1).getDate(), 29);

for (const option of diamondDurations) {
  assert.equal(calculatePrice(option).finalAmount, option.totalPrice);
  assert.equal(calculatePrice(option).membershipDiscount, option.packagePromotion);
}
const voucher = findVoucher('NEONGYM2026', diamondDurations[0].totalPrice).voucher;
assert.equal(calculatePrice(diamondDurations[0], voucher).finalAmount, diamondDurations[0].totalPrice - 500000);
assert.equal(addCalendarMonths(parseLocalDate('2026-01-31'), 1).getDate(), 28);
console.log('package pricing, voucher, calendar expiry: OK');
