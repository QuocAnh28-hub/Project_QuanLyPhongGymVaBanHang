-- Correct the legacy September demo attendance that was never closed.
START TRANSACTION;
UPDATE checkin
SET ThoiGianCheckOut='2026-09-23 08:35:00',TrangThai='CHECKED_OUT'
WHERE CheckInID=4 AND HoiVienID=1
  AND ThoiGianCheckIn='2026-09-23 07:10:00'
  AND TrangThai='CHECKED_IN' AND ThoiGianCheckOut IS NULL;
COMMIT;
