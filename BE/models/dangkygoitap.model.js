const db = require("../common/db");

function appError(status, code, message) {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  return error;
}

function addMonthsClamped(dateString, months) {
  const [year, month, day] = dateString.split("-").map(Number);
  const targetMonthIndex = month - 1 + months;
  const targetYear = year + Math.floor(targetMonthIndex / 12);
  const normalizedMonth = ((targetMonthIndex % 12) + 12) % 12;
  const lastDay = new Date(Date.UTC(targetYear, normalizedMonth + 1, 0)).getUTCDate();
  const result = new Date(
    Date.UTC(targetYear, normalizedMonth, Math.min(day, lastDay)),
  );

  return [
    result.getUTCFullYear(),
    String(result.getUTCMonth() + 1).padStart(2, "0"),
    String(result.getUTCDate()).padStart(2, "0"),
  ].join("-");
}

const Dangkygoitap = (dangkygoitap) => {
  this.DangKyID = dangkygoitap.DangKyID;
  this.HoiVienID = dangkygoitap.HoiVienID;
  this.GoiTapID = dangkygoitap.GoiTapID;
  this.GoiTapThoiHanID = dangkygoitap.GoiTapThoiHanID;
  this.NgayDangKy = dangkygoitap.NgayDangKy;
  this.NgayBatDau = dangkygoitap.NgayBatDau;
  this.NgayKetThuc = dangkygoitap.NgayKetThuc;
  this.GiaThanhToan = dangkygoitap.GiaThanhToan;
  this.TrangThai = dangkygoitap.TrangThai;
};

Dangkygoitap.getById = (DangKyID, callback) => {
  const sqlString = "SELECT * FROM `dangkygoitap` WHERE `DangKyID` = ?";
  db.query(sqlString, [DangKyID], (err, result) => {
    if (err) return callback(err);
    callback(null, result);
  });
};

Dangkygoitap.getDetailById = (DangKyID, callback) => {
  const sqlString = `
    SELECT
      d.DangKyID,
      d.HoiVienID,
      d.GoiTapID,
      d.GoiTapThoiHanID,
      d.NgayDangKy,
      DATE_FORMAT(d.NgayBatDau, '%Y-%m-%d') AS NgayBatDau,
      DATE_FORMAT(d.NgayKetThuc, '%Y-%m-%d') AS NgayKetThuc,
      d.GiaThanhToan,
      d.TrangThai,
      g.TenGoi,
      t.SoThang,
      t.ThangTang,
      t.GiaGoc,
      t.GiaBan,
      COALESCE(SUM(km.SoTienGiam), 0) AS SoTienGiam
    FROM dangkygoitap d
    INNER JOIN goitap g
      ON g.GoiTapID = d.GoiTapID
    INNER JOIN GoiTapThoiHan t
      ON t.GoiTapThoiHanID = d.GoiTapThoiHanID
    LEFT JOIN ApDungKhuyenMaiGoiTap km
      ON km.DangKyID = d.DangKyID
    WHERE d.DangKyID = ?
    GROUP BY
      d.DangKyID,
      d.HoiVienID,
      d.GoiTapID,
      d.GoiTapThoiHanID,
      d.NgayDangKy,
      d.NgayBatDau,
      d.NgayKetThuc,
      d.GiaThanhToan,
      d.TrangThai,
      g.TenGoi,
      t.SoThang,
      t.ThangTang,
      t.GiaGoc,
      t.GiaBan
    LIMIT 1
  `;

  db.query(sqlString, [DangKyID], (err, result) => {
    if (err) return callback(err);
    callback(null, result?.[0] ?? null);
  });
};

Dangkygoitap.getAll = (callback) => {
  db.query("SELECT * FROM `dangkygoitap`", (err, result) => {
    if (err) return callback(err);
    callback(null, result);
  });
};

Dangkygoitap.register = (input, callback) => {
  db.getConnection(async (connectionError, connection) => {
    if (connectionError) return callback(connectionError);

    const query = connection.promise();

    try {
      await query.beginTransaction();

      const [members] = await query.query(
        `SELECT
           h.HoiVienID,
           h.TaiKhoanID,
           h.TrangThai AS HoiVienTrangThai,
           t.VaiTro,
           t.TrangThai AS TaiKhoanTrangThai
         FROM hoivien h
         INNER JOIN taikhoan t ON t.TaiKhoanID = h.TaiKhoanID
         WHERE h.TaiKhoanID = ?
         LIMIT 1`,
        [input.TaiKhoanID],
      );

      if (!members.length) {
        throw appError(404, "MEMBER_NOT_FOUND", "Không tìm thấy hồ sơ hội viên");
      }

      const member = members[0];
      if (
        member.HoiVienTrangThai !== "ACTIVE" ||
        member.TaiKhoanTrangThai !== "ACTIVE" ||
        member.VaiTro !== "CUSTOMER"
      ) {
        throw appError(403, "MEMBER_INACTIVE", "Hội viên không được phép đăng ký gói tập");
      }

      const [packages] = await query.query(
        `SELECT
           g.GoiTapID,
           g.TenGoi,
           g.TrangThai AS GoiTapTrangThai,
           th.GoiTapThoiHanID,
           th.SoThang,
           th.ThangTang,
           th.GiaGoc,
           th.GiaBan,
           th.TrangThai AS ThoiHanTrangThai
         FROM goitap g
         INNER JOIN GoiTapThoiHan th
           ON th.GoiTapID = g.GoiTapID
         WHERE g.GoiTapID = ?
           AND th.GoiTapThoiHanID = ?
         LIMIT 1`,
        [input.GoiTapID, input.GoiTapThoiHanID],
      );

      if (!packages.length) {
        throw appError(
          404,
          "PACKAGE_DURATION_NOT_FOUND",
          "Không tìm thấy gói tập hoặc thời hạn đã chọn",
        );
      }

      const selectedPackage = packages[0];
      if (
        selectedPackage.GoiTapTrangThai !== "ACTIVE" ||
        selectedPackage.ThoiHanTrangThai !== "ACTIVE"
      ) {
        throw appError(409, "PACKAGE_INACTIVE", "Gói tập hoặc thời hạn hiện không mở đăng ký");
      }

      const [duplicates] = await query.query(
        `SELECT DangKyID
         FROM dangkygoitap
         WHERE HoiVienID = ?
           AND GoiTapID = ?
           AND GoiTapThoiHanID = ?
           AND TrangThai = 'PENDING'
         LIMIT 1`,
        [
          member.HoiVienID,
          input.GoiTapID,
          input.GoiTapThoiHanID,
        ],
      );

      if (duplicates.length) {
        throw appError(
          409,
          "PENDING_EXISTS",
          "Bạn đã có đăng ký gói này đang chờ xử lý",
        );
      }

      const giaBan = Number(selectedPackage.GiaBan);
      let discount = 0;
      let promotion = null;

      if (input.MaKhuyenMai) {
        const [promotions] = await query.query(
          `SELECT
             KhuyenMaiID,
             MaKhuyenMai,
             PhanTramGiam,
             SoTienGiam
           FROM khuyenmai
           WHERE MaKhuyenMai = ?
             AND TrangThai = 'ACTIVE'
             AND NgayBatDau <= NOW()
             AND NgayKetThuc >= NOW()
           LIMIT 1`,
          [input.MaKhuyenMai],
        );

        if (!promotions.length) {
          throw appError(400, "INVALID_VOUCHER", "Mã khuyến mãi không hợp lệ hoặc đã hết hạn");
        }

        promotion = promotions[0];
        const fixedDiscount = Number(promotion.SoTienGiam || 0);
        const percentDiscount = Number(promotion.PhanTramGiam || 0);

        // Current schema can store both values. Fixed amount takes priority.
        if (fixedDiscount > 0) {
          discount = fixedDiscount;
        } else if (percentDiscount > 0) {
          discount = Math.round((giaBan * percentDiscount) / 100);
        }

        discount = Math.min(giaBan, Math.max(0, discount));
      }

      const giaThanhToan = Math.max(0, giaBan - discount);
      const totalMonths =
        Number(selectedPackage.SoThang) + Number(selectedPackage.ThangTang || 0);
      const ngayKetThuc = addMonthsClamped(input.NgayBatDau, totalMonths);

      const [insertResult] = await query.query(
        `INSERT INTO dangkygoitap
          (
            HoiVienID,
            GoiTapID,
            GoiTapThoiHanID,
            NgayDangKy,
            NgayBatDau,
            NgayKetThuc,
            GiaThanhToan,
            TrangThai
          )
         VALUES (?, ?, ?, NOW(), ?, ?, ?, 'PENDING')`,
        [
          member.HoiVienID,
          input.GoiTapID,
          input.GoiTapThoiHanID,
          input.NgayBatDau,
          ngayKetThuc,
          giaThanhToan,
        ],
      );

      const dangKyID = insertResult.insertId;

      if (promotion && discount > 0) {
        await query.query(
          `INSERT INTO ApDungKhuyenMaiGoiTap
            (KhuyenMaiID, DangKyID, SoTienGiam, NgayApDung)
           VALUES (?, ?, ?, NOW())`,
          [promotion.KhuyenMaiID, dangKyID, discount],
        );
      }

      await query.commit();

      callback(null, {
        DangKyID: dangKyID,
        HoiVienID: member.HoiVienID,
        GoiTapID: input.GoiTapID,
        GoiTapThoiHanID: input.GoiTapThoiHanID,
        TenGoi: selectedPackage.TenGoi,
        SoThang: Number(selectedPackage.SoThang),
        ThangTang: Number(selectedPackage.ThangTang || 0),
        NgayBatDau: input.NgayBatDau,
        NgayKetThuc: ngayKetThuc,
        GiaGoc: Number(selectedPackage.GiaGoc),
        GiaBan: giaBan,
        SoTienGiam: discount,
        GiaThanhToan: giaThanhToan,
        MaKhuyenMai: promotion?.MaKhuyenMai ?? null,
        TrangThai: "PENDING",
      });
    } catch (error) {
      try {
        await query.rollback();
      } catch (_) {
        // Keep the original error.
      }
      callback(error);
    } finally {
      connection.release();
    }
  });
};

Dangkygoitap.insert = (dangkygoitap, callback) => {
  const sqlString = "INSERT INTO `dangkygoitap` SET ?";
  db.query(sqlString, dangkygoitap, (err, res) => {
    if (err) return callback(err);
    callback(null, { DangKyID: res.insertId, ...dangkygoitap });
  });
};

Dangkygoitap.update = (dangkygoitap, DangKyID, callback) => {
  db.query(
    "UPDATE `dangkygoitap` SET ? WHERE `DangKyID` = ?",
    [dangkygoitap, DangKyID],
    (err) => {
      if (err) return callback(err);
      callback(null, { message: "Cập nhật dangkygoitap thành công" });
    },
  );
};

Dangkygoitap.delete = (DangKyID, callback) => {
  db.query(
    "DELETE FROM `dangkygoitap` WHERE `DangKyID` = ?",
    [DangKyID],
    (err) => {
      if (err) return callback(err);
      callback(null, { message: "Xóa dangkygoitap thành công" });
    },
  );
};

module.exports = Dangkygoitap;
