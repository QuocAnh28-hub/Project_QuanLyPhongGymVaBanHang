export const money = (value: number) =>
  new Intl.NumberFormat('vi-VN').format(value) + ' đ'
