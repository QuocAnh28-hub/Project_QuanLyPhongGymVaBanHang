-- Safe upgrade for existing shopcheckout without KhoID. Run explicitly after 003.
-- Existing rows keep NULL: their historical warehouse is unknown; do not invent one.
-- No stock, payment, invoice or order status is changed. Idempotent.
SET @checkout_column_sql = IF(
  EXISTS(SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='shopcheckout' AND COLUMN_NAME='KhoID'),
  'SELECT 1',
  'ALTER TABLE shopcheckout ADD COLUMN KhoID INT NULL AFTER HoiVienID'
);
PREPARE checkout_column FROM @checkout_column_sql;
EXECUTE checkout_column;
DEALLOCATE PREPARE checkout_column;
SET @checkout_fk_sql = IF(
  EXISTS(SELECT 1 FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='shopcheckout' AND COLUMN_NAME='KhoID' AND REFERENCED_TABLE_NAME='kho'),
  'SELECT 1',
  'ALTER TABLE shopcheckout ADD CONSTRAINT FK_ShopCheckout_WarehouseUpgrade FOREIGN KEY (KhoID) REFERENCES kho(KhoID) ON DELETE RESTRICT ON UPDATE CASCADE'
);
PREPARE checkout_fk FROM @checkout_fk_sql;
EXECUTE checkout_fk;
DEALLOCATE PREPARE checkout_fk;
