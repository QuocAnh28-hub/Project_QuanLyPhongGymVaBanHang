-- QA-Gym registration migration
-- Run after 001_package_details.sql and package_details_seed.sql.

USE gym_management;

-- 1) Add GoiTapThoiHanID as nullable first so existing test rows can be backfilled.
SET @column_exists = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'DangKyGoiTap'
    AND COLUMN_NAME = 'GoiTapThoiHanID'
);

SET @sql = IF(
  @column_exists = 0,
  'ALTER TABLE DangKyGoiTap ADD COLUMN GoiTapThoiHanID INT NULL AFTER GoiTapID',
  'SELECT 1'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 2) Existing registrations are mapped to the 1-month duration of the same package.
UPDATE DangKyGoiTap d
INNER JOIN GoiTapThoiHan th
  ON th.GoiTapID = d.GoiTapID
 AND th.SoThang = 1
SET d.GoiTapThoiHanID = th.GoiTapThoiHanID
WHERE d.GoiTapThoiHanID IS NULL;

-- Check before NOT NULL. This result must be 0.
SELECT COUNT(*) AS DangKyChuaCoThoiHan
FROM DangKyGoiTap
WHERE GoiTapThoiHanID IS NULL;

ALTER TABLE DangKyGoiTap
  MODIFY COLUMN GoiTapThoiHanID INT NOT NULL;

-- 3) Add the FK only if it does not already exist.
SET @fk_exists = (
  SELECT COUNT(*)
  FROM information_schema.TABLE_CONSTRAINTS
  WHERE CONSTRAINT_SCHEMA = DATABASE()
    AND TABLE_NAME = 'DangKyGoiTap'
    AND CONSTRAINT_NAME = 'FK_DangKyGoiTap_GoiTapThoiHan'
    AND CONSTRAINT_TYPE = 'FOREIGN KEY'
);

SET @sql = IF(
  @fk_exists = 0,
  'ALTER TABLE DangKyGoiTap ADD CONSTRAINT FK_DangKyGoiTap_GoiTapThoiHan FOREIGN KEY (GoiTapThoiHanID) REFERENCES GoiTapThoiHan(GoiTapThoiHanID) ON DELETE RESTRICT ON UPDATE CASCADE',
  'SELECT 1'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
