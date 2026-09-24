-- QA-Gym package detail migration
-- Run on gym_management before starting the updated backend.

USE gym_management;

CREATE TABLE IF NOT EXISTS GoiTapThoiHan (
    GoiTapThoiHanID INT AUTO_INCREMENT PRIMARY KEY,
    GoiTapID INT NOT NULL,
    SoThang INT NOT NULL,
    ThangTang INT NOT NULL DEFAULT 0,
    GiaGoc DECIMAL(15,2) NOT NULL DEFAULT 0,
    GiaBan DECIMAL(15,2) NOT NULL DEFAULT 0,
    TrangThai ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT FK_GoiTapThoiHan_GoiTap
        FOREIGN KEY (GoiTapID)
        REFERENCES GoiTap(GoiTapID)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT UQ_GoiTap_ThoiHan
        UNIQUE (GoiTapID, SoThang)
);

CREATE TABLE IF NOT EXISTS QuyenLoiGoiTap (
    QuyenLoiID INT AUTO_INCREMENT PRIMARY KEY,
    GoiTapID INT NOT NULL,
    MaQuyenLoi VARCHAR(50) NOT NULL,
    TenQuyenLoi VARCHAR(150) NOT NULL,
    MoTa VARCHAR(500) NULL,
    SoLuong INT NULL,
    ThuTu INT NOT NULL DEFAULT 0,
    TrangThai ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT FK_QuyenLoiGoiTap_GoiTap
        FOREIGN KEY (GoiTapID)
        REFERENCES GoiTap(GoiTapID)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT UQ_GoiTap_QuyenLoi
        UNIQUE (GoiTapID, MaQuyenLoi)
);
