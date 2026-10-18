const db=require('../common/db');
// Read-only preview of the existing registration voucher rules; no payment writes.
module.exports=async(req,res)=>{
 const packageId=Number(req.params.GoiTapID),durationId=Number(req.query.durationId);
 const code=String(req.query.code||'').trim().toUpperCase();
 if(!Number.isSafeInteger(packageId)||packageId<=0||!Number.isSafeInteger(durationId)||durationId<=0||!code||code.length>50)
  return res.status(400).json({message:'Vui lòng nhập mã và chọn thời hạn gói tập hợp lệ.'});
 try{
  const [[term]]=await db.promise().query(`SELECT t.GiaBan FROM goitapthoihan t JOIN goitap g USING(GoiTapID)
   WHERE g.GoiTapID=? AND t.GoiTapThoiHanID=? AND g.TrangThai='ACTIVE' AND t.TrangThai='ACTIVE'`,[packageId,durationId]);
  if(!term)return res.status(404).json({message:'Không tìm thấy thời hạn đang bán của gói tập.'});
  const [[promotion]]=await db.promise().query(`SELECT MaKhuyenMai,PhanTramGiam,SoTienGiam FROM khuyenmai
   WHERE MaKhuyenMai=? AND TrangThai='ACTIVE' AND NgayBatDau<=NOW() AND NgayKetThuc>=NOW() LIMIT 1`,[code]);
  if(!promotion)return res.status(400).json({message:'Mã voucher không hợp lệ, đã ngừng hoặc chưa trong thời gian áp dụng.'});
  const price=Number(term.GiaBan),fixed=Number(promotion.SoTienGiam||0),percent=Number(promotion.PhanTramGiam||0);
  const discount=Math.min(price,Math.max(0,fixed>0?fixed:Math.round(price*percent/100)));
  if(!Number.isFinite(discount)||discount<=0)return res.status(400).json({message:'Mã này không có mức giảm hợp lệ cho gói tập.'});
  res.json({code:promotion.MaKhuyenMai,type:'fixed',value:discount,active:true});
 }catch(e){console.error('[package-voucher]',e.code||e.name);res.status(500).json({message:'Không kiểm tra được voucher. Vui lòng thử lại.'});}
};
