-- QR tokens are temporary; attendance history must survive token cleanup.
ALTER TABLE checkin
  DROP FOREIGN KEY FK_CheckIn_MaQR,
  MODIFY MaQRID INT NULL,
  ADD CONSTRAINT FK_CheckIn_MaQR_History FOREIGN KEY (MaQRID)
    REFERENCES maqr (MaQRID) ON DELETE SET NULL ON UPDATE CASCADE;
