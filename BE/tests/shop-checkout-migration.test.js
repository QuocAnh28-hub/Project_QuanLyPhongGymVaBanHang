// Upgrade only an isolated legacy schema, never the configured application schema.
const assert=require('assert/strict');
const fs=require('fs'),path=require('path');
require('dotenv').config({path:path.join(__dirname,'../.env')});
const mysql=require('mysql2/promise');
(async()=>{
 const c=await mysql.createConnection({host:process.env.DB_HOST,port:+(process.env.DB_PORT||3306),user:process.env.DB_USER,password:process.env.DB_PASSWORD,database:process.env.DB_NAME});
 const testDb=`gym_checkout_upgrade_${Date.now()}`;
 try{
  await c.query('CREATE DATABASE ??',[testDb]);await c.query('USE ??',[testDb]);
  await c.query('CREATE TABLE kho (KhoID INT PRIMARY KEY)');
  await c.query('CREATE TABLE shopcheckout (DonHangID INT PRIMARY KEY,HoiVienID INT NOT NULL,RequestKey VARCHAR(64),RequestHash CHAR(64),ThanhToanID INT UNIQUE)');
  await c.query("INSERT INTO shopcheckout VALUES (123,456,'unchanged-key',REPEAT('a',64),789)");
  const sql=fs.readFileSync(path.join(__dirname,'../../database/migrations/004_shop_checkout_warehouse.sql'),'utf8');
  for(let run=0;run<2;run++)for(const statement of sql.replace(/--[^\r\n]*/g,'').split(';').map(s=>s.trim()).filter(Boolean))await c.query(statement);
  const [rows]=await c.query('SELECT * FROM shopcheckout');assert.equal(rows.length,1);
  assert.equal(rows[0].KhoID,null);assert.equal(rows[0].RequestKey,'unchanged-key');assert.equal(rows[0].ThanhToanID,789);
  const [[fk]]=await c.query("SELECT COUNT(*) n FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='shopcheckout' AND COLUMN_NAME='KhoID' AND REFERENCED_TABLE_NAME='kho'");assert.equal(fk.n,1);
  await assert.rejects(c.query('UPDATE shopcheckout SET KhoID=999 WHERE DonHangID=123'),e=>e.code==='ER_NO_REFERENCED_ROW_2');
  console.log('PASS: legacy KhoID upgrade preserves data and unknown warehouse, rerun safe, foreign key enforced.');
 }finally{await c.query('DROP DATABASE IF EXISTS ??',[testDb]);await c.end();}
})().catch(e=>{console.error(e.message);process.exitCode=1});
