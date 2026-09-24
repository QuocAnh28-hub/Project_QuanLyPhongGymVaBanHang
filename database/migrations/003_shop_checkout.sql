-- Run against the database configured in BE/.env (no existing data is changed).
CREATE TABLE IF NOT EXISTS shopcheckout (
    DonHangID INT NOT NULL PRIMARY KEY,
    ThanhToanID INT NOT NULL UNIQUE,
    HoiVienID INT NOT NULL,
    RequestKey VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
    RequestHash CHAR(64) NOT NULL,
    TenNguoiNhan VARCHAR(100) NOT NULL,
    SoDienThoai VARCHAR(20) NOT NULL,
    CachNhan ENUM('PICKUP', 'DELIVERY') NOT NULL,
    PhiVanChuyen DECIMAL(15,2) NOT NULL DEFAULT 0,
    UNIQUE KEY UQ_ShopCheckout_Request (HoiVienID, RequestKey),
    CONSTRAINT FK_ShopCheckout_Order FOREIGN KEY (DonHangID) REFERENCES donhang(DonHangID),
    CONSTRAINT FK_ShopCheckout_Payment FOREIGN KEY (ThanhToanID) REFERENCES thanhtoan(ThanhToanID),
    CONSTRAINT FK_ShopCheckout_Member FOREIGN KEY (HoiVienID) REFERENCES hoivien(HoiVienID)
);
