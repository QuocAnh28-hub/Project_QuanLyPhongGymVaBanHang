import {useEffect,useMemo,useState} from 'react'
import {PageTop} from '../components/CommerceUi'
import {money} from '../data/admin-utils'
import {getPayments,type Payment} from '../services/admin-finance'

const statuses=['','PENDING','SUCCESS','FAILED','CANCELLED'], methods=['','TIEN_MAT','CHUYEN_KHOAN','THE']
export default function RevenueInvoicePage(){
 const [items,setItems]=useState<Payment[]>([]),[selected,setSelected]=useState<Payment>(),[search,setSearch]=useState(''),[status,setStatus]=useState(''),[method,setMethod]=useState(''),[from,setFrom]=useState(''),[to,setTo]=useState(''),[error,setError]=useState('')
 useEffect(()=>{getPayments().then(rows=>{setItems(rows);setSelected(rows[0])}).catch(e=>setError(e.message))},[])
 const shown=useMemo(()=>items.filter(x=>(!status||x.TrangThai===status)&&(!method||x.PhuongThucThanhToan===method)&&(!from||x.NgayThanhToan.slice(0,10)>=from)&&(!to||x.NgayThanhToan.slice(0,10)<=to)&&`${x.ThanhToanID} ${x.HoaDonID||''} ${x.HoiVien} ${x.NoiDung||''}`.toLowerCase().includes(search.toLowerCase())),[items,status,method,from,to,search])
 return <div className="admin-page commerce-page">
  <PageTop trail="TÀI CHÍNH › THANH TOÁN & HÓA ĐƠN / BIÊN NHẬN" title="THANH TOÁN & HÓA ĐƠN / BIÊN NHẬN" actions={null} metrics={[
   ['DOANH THU ĐÃ THU',money(items.filter(x=>x.TrangThai==='SUCCESS').reduce((s,x)=>s+Number(x.SoTien),0)),'Chỉ giao dịch SUCCESS'],
   ['THÀNH CÔNG',String(items.filter(x=>x.TrangThai==='SUCCESS').length),'Giao dịch'],['ĐANG CHỜ',String(items.filter(x=>x.TrangThai==='PENDING').length),'Không tính doanh thu'],['BIÊN NHẬN',String(items.filter(x=>x.HoaDonID).length),'Hóa đơn trong hệ thống']]}/>
  <div className="commerce-filters"><div className="commerce-fields">
   <input placeholder="Mã giao dịch, hóa đơn, hội viên, nội dung" value={search} onChange={e=>setSearch(e.target.value)}/>
   <select value={status} onChange={e=>setStatus(e.target.value)}>{statuses.map(x=><option key={x} value={x}>{x||'Tất cả trạng thái'}</option>)}</select>
   <select value={method} onChange={e=>setMethod(e.target.value)}>{methods.map(x=><option key={x} value={x}>{x||'Tất cả phương thức'}</option>)}</select>
   <label>Từ ngày<input type="date" value={from} onChange={e=>setFrom(e.target.value)}/></label><label>Đến ngày<input type="date" value={to} onChange={e=>setTo(e.target.value)}/></label>
  </div></div>{error&&<p className="empty">{error}</p>}
  <div className="commerce-split"><section className="commerce-card"><h2>GIAO DỊCH THẬT TỪ CƠ SỞ DỮ LIỆU</h2><div className="commerce-table-wrap"><table className="commerce-table"><thead><tr><th>MÃ / NGÀY</th><th>HỘI VIÊN</th><th>NỘI DUNG / LOẠI</th><th>SỐ TIỀN</th><th>PHƯƠNG THỨC</th><th>TRẠNG THÁI</th></tr></thead><tbody>{shown.map(x=><tr key={x.ThanhToanID} className={selected?.ThanhToanID===x.ThanhToanID?'selected':''} onClick={()=>setSelected(x)}><td><b>TT-{x.ThanhToanID}</b><small>{new Date(x.NgayThanhToan).toLocaleString('vi-VN')}</small></td><td><b>{x.HoiVien}</b><small>HV-{x.HoiVienID}</small></td><td>{x.NoiDung||'—'}<small>{x.Loai}</small></td><td>{money(Number(x.SoTien))}</td><td>{x.PhuongThucThanhToan}</td><td><b>{x.TrangThai}</b></td></tr>)}</tbody></table>{!shown.length&&<p className="empty">Không có giao dịch phù hợp.</p>}</div></section>
   <aside className="commerce-card commerce-detail"><h2>CHI TIẾT THANH TOÁN</h2>{selected?<><h3>TT-{selected.ThanhToanID}</h3><dl>{[['Hội viên',selected.HoiVien],['Nội dung',selected.NoiDung||'—'],['Loại',selected.Loai],['Số tiền',money(Number(selected.SoTien))],['Phương thức',selected.PhuongThucThanhToan],['Trạng thái',selected.TrangThai],['Ngày thanh toán',new Date(selected.NgayThanhToan).toLocaleString('vi-VN')],['HoaDonID',selected.HoaDonID?String(selected.HoaDonID):'Chưa có']].map(([a,b])=><div key={a}><dt>{a}</dt><dd>{b}</dd></div>)}</dl><p>Hệ thống chưa có dữ liệu VAT, MST, XML hoặc chữ ký số. Không hỗ trợ hoàn tiền từ trang này.</p></>:<p>Chưa có dữ liệu.</p>}</aside>
  </div></div>
}
