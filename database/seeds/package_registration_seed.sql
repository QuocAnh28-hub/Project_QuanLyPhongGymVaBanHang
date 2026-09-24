-- Align the current Mobile voucher with the backend.
USE gym_management;

INSERT INTO KhuyenMai
(MaKhuyenMai, TenKhuyenMai, PhanTramGiam, SoTienGiam, NgayBatDau, NgayKetThuc, DieuKien, TrangThai)
VALUES
(
  'NEONGYM2026',
  'Ưu đãi QA-Gym 2026',
  0.00,
  500000.00,
  '2026-01-01 00:00:00',
  '2026-12-31 23:59:59',
  'Voucher cố định 500.000đ dùng để đồng bộ flow Mobile hiện tại.',
  'ACTIVE'
)
ON DUPLICATE KEY UPDATE
TenKhuyenMai = VALUES(TenKhuyenMai),
PhanTramGiam = VALUES(PhanTramGiam),
SoTienGiam = VALUES(SoTienGiam),
NgayBatDau = VALUES(NgayBatDau),
NgayKetThuc = VALUES(NgayKetThuc),
DieuKien = VALUES(DieuKien),
TrangThai = VALUES(TrangThai);
