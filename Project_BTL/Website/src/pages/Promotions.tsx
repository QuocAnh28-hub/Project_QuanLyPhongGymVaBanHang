import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Modal } from '../components/AdminLayout'
import { PageTop } from '../components/CommerceUi'
import { Pagination } from '../components/MemberUi'
import { money } from '../data/admin-utils'
import { searchText } from '../services/catalog'
import { deactivatePromotion, getPromotionHistory, getPromotions, getPromotionStats, savePromotion, type Promotion, type PromotionHistory, type PromotionStats } from '../services/admin-finance'
import { dateInput, previewDiscount, promotionLabels, promotionState, promotionTime, usageLabels, validatePromotion } from '../services/promotions'

const sourceLabels: Record<string,string> = { PACKAGE: 'Gói tập', SHOP: 'Shop · lịch sử', PT: 'PT · lịch sử' }
const time=(value:string)=>promotionTime(value).toLocaleString('vi-VN',{timeZone:'Asia/Bangkok',day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'})
const formTime=(value:FormDataEntryValue|null)=>{const s=String(value||'').replace('T',' ');return s.length===16?s+':00':s}
export default function Promotions() {
  const [items,setItems]=useState<Promotion[]>([]),[stats,setStats]=useState<PromotionStats>(),[history,setHistory]=useState<PromotionHistory[]>([])
  const [loading,setLoading]=useState(true),[error,setError]=useState(''),[notice,setNotice]=useState(''),[busy,setBusy]=useState(false)
  const [query,setQuery]=useState(''),[status,setStatus]=useState(''),[kind,setKind]=useState(''),[page,setPage]=useState(1)
  const [historyQuery,setHistoryQuery]=useState(''),[historyStatus,setHistoryStatus]=useState(''),[source,setSource]=useState(''),[historyPage,setHistoryPage]=useState(1)
  const [editing,setEditing]=useState<Partial<Promotion>|null>(null),[stopping,setStopping]=useState<Promotion|null>(null),[modalError,setModalError]=useState('')
  const [discountType,setDiscountType]=useState('percent'),[discountValue,setDiscountValue]=useState(''),[samplePrice,setSamplePrice]=useState('1000000')
  const lock=useRef(false),version=useRef(0)
  const load=async()=>{
    const current=++version.current;setLoading(true)
    try {const [a,b,c]=await Promise.all([getPromotions(),getPromotionStats(),getPromotionHistory()]);if(current!==version.current)return;setItems(a);setStats(b);setHistory(c);setError('')}
    catch(e){if(current===version.current)setError(e instanceof Error?e.message:'Không tải được khuyến mãi.')}
    finally{if(current===version.current)setLoading(false)}
  }
  useEffect(()=>{let active=true;void Promise.resolve().then(()=>{if(active)void load()});return()=>{active=false}},[])
  const [now,setNow]=useState(()=>Date.now())
  useEffect(()=>{const timer=window.setInterval(()=>setNow(Date.now()),30000);return()=>window.clearInterval(timer)},[])
  const shown=items.filter(x=>(!status||promotionState(x,now)===status)&&(!kind||(kind==='percent'?Number(x.PhanTramGiam)>0:Number(x.SoTienGiam)>0))&&searchText(x.MaKhuyenMai+' '+x.TenKhuyenMai+' '+(x.DieuKien||'')).includes(searchText(query.trim())))
  const historyShown=history.filter(x=>(!source||x.Loai===source)&&(!historyStatus||x.TinhTrangThanhToan===historyStatus)&&searchText(x.MaKhuyenMai+' '+x.TenKhuyenMai+' '+x.ThamChieuID).includes(searchText(historyQuery.trim())))
  const currentPage=Math.min(page,Math.max(1,Math.ceil(shown.length/10))),currentHistoryPage=Math.min(historyPage,Math.max(1,Math.ceil(historyShown.length/10)))
  function open(p:Partial<Promotion>){setModalError('');setDiscountType(Number(p.SoTienGiam)>0?'amount':'percent');setDiscountValue(String(Number(p.SoTienGiam)>0?p.SoTienGiam:p.PhanTramGiam||''));setEditing(p)}
  function close(){if(!lock.current){setEditing(null);setStopping(null);setModalError('')}}
  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();if(lock.current||!editing)return
    const d=new FormData(event.currentTarget)
    try {
      const payload=validatePromotion({KhuyenMaiID:editing.KhuyenMaiID,MaKhuyenMai:String(d.get('code')||''),TenKhuyenMai:String(d.get('name')||''),PhanTramGiam:discountType==='percent'?Number(discountValue):0,SoTienGiam:discountType==='amount'?Number(discountValue):0,NgayBatDau:formTime(d.get('from')),NgayKetThuc:formTime(d.get('to')),DieuKien:String(d.get('condition')||'').trim()||null,TrangThai:String(d.get('status')) as Promotion['TrangThai']})
      lock.current=true;setBusy(true);setModalError('');await savePromotion(payload);setEditing(null);setNotice('Đã lưu chương trình khuyến mãi.');await load()
    } catch(e){setModalError(e instanceof Error?e.message:'Không thể lưu khuyến mãi.')}
    finally{lock.current=false;setBusy(false)}
  }
  async function stop(){if(lock.current||!stopping)return;lock.current=true;setBusy(true);setModalError('')
    try{await deactivatePromotion(stopping.KhuyenMaiID);setStopping(null);setNotice('Đã ngừng chương trình, giữ nguyên lịch sử sử dụng.');await load()}
    catch(e){setModalError(e instanceof Error?e.message:'Không thể ngừng chương trình.')}
    finally{lock.current=false;setBusy(false)}
  }
  const sample=Number(samplePrice),discount=Number(discountValue)
  const validSample=Number.isFinite(sample)&&sample>=0&&Number.isFinite(discount)&&discount>0&&(discountType!=='percent'||discount<=100)
  return <div className="admin-page commerce-page finance-admin-page promotions-admin-page">
    <PageTop trail="MARKETING › KHUYẾN MÃI" title="QUẢN LÝ KHUYẾN MÃI" actions={<>
      <button disabled={loading||busy} onClick={()=>void load()}>↻ Làm mới</button>
      <button className="primary" disabled={busy} onClick={()=>open({TrangThai:'ACTIVE',PhanTramGiam:0,SoTienGiam:0})}>＋ Tạo chương trình</button>
    </>} metrics={[
      ['CHƯƠNG TRÌNH',loading?'…':String(stats?.SoChuongTrinh||0),'Tất cả chương trình'],
      ['ĐANG DIỄN RA',loading?'…':String(items.filter(x=>promotionState(x,now)==='ACTIVE').length),'Trong thời gian hiệu lực'],
      ['LƯỢT ĐÃ THANH TOÁN',loading?'…':String(stats?.LuotSuDung||0),'Chỉ giao dịch SUCCESS đã đối soát'],
      ['TỔNG GIẢM ĐÃ GHI NHẬN',loading?'…':money(Number(stats?.TongSoTienGiam||0)),'Không gồm chờ thanh toán / chưa đối soát']
    ]}/>
    <p className="promotion-capabilities">Luồng gói tập hỗ trợ áp dụng mã. Shop/PT chỉ có dữ liệu lịch sử, chưa hỗ trợ nhập mã trong checkout. Điều kiện mô tả chưa được Backend tự kiểm tra.</p>
    {notice&&<p className="catalog-notice" role="status">{notice}</p>}
    {error&&<p className="catalog-error" role="alert">{error} <button disabled={loading} onClick={()=>void load()}>Thử lại</button></p>}
    <section className="commerce-card promotion-list-card">
      <header className="panel-heading"><div><span>CHƯƠNG TRÌNH</span><h2>Danh sách khuyến mãi</h2></div><b>{shown.length} chương trình</b></header>
      <div className="promotion-filters">
        <input aria-label="Tìm chương trình" placeholder="Mã, tên hoặc điều kiện…" value={query} onChange={e=>{setQuery(e.target.value);setPage(1)}}/>
        <select aria-label="Trạng thái chương trình" value={status} onChange={e=>{setStatus(e.target.value);setPage(1)}}><option value="">Tất cả trạng thái</option>{Object.entries(promotionLabels).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select>
        <select aria-label="Loại giảm giá" value={kind} onChange={e=>{setKind(e.target.value);setPage(1)}}><option value="">Tất cả mức giảm</option><option value="percent">Phần trăm</option><option value="amount">Tiền cố định</option></select>
        <button onClick={()=>{setQuery('');setStatus('');setKind('');setPage(1)}}>Xóa bộ lọc</button>
      </div>
      {loading?<p className="empty" role="status">Đang tải chương trình…</p>:<>
        <div className="commerce-table-wrap"><table className="commerce-table promotion-table"><thead><tr>{['MÃ / TÊN','MỨC GIẢM','THỜI GIAN','TRẠNG THÁI','ĐÃ THANH TOÁN','THAO TÁC'].map(t=><th key={t}>{t}</th>)}</tr></thead><tbody>
          {shown.slice((currentPage-1)*10,currentPage*10).map(x=>{const state=promotionState(x,now);return <tr key={x.KhuyenMaiID}>
            <td><b className="promotion-code">{x.MaKhuyenMai}</b><small>{x.TenKhuyenMai}</small>{x.DieuKien&&<small className="promotion-condition" title={x.DieuKien}>{x.DieuKien}</small>}</td>
            <td data-label="Mức giảm" className="numeric promotion-discount-value">{Number(x.SoTienGiam)>0?money(Number(x.SoTienGiam)):Number(x.PhanTramGiam)+'%'}{Number(x.SoTienGiam)>0&&Number(x.PhanTramGiam)>0&&<small>Hai mức giảm cũ · cần sửa</small>}</td>
            <td data-label="Thời gian"><span>{time(x.NgayBatDau)}</span><small>→ {time(x.NgayKetThuc)}</small></td>
            <td data-label="Trạng thái"><span className={'status-badge promotion-state-'+state.toLowerCase()}>{promotionLabels[state]}</span></td>
            <td data-label="Đã thanh toán" className="numeric"><b>{x.LuotSuDung} lượt</b><small>{money(Number(x.TongSoTienGiam))}</small></td>
            <td className="row-actions"><button disabled={busy} onClick={()=>open(x)}>Sửa</button><button disabled={busy||state==='STOPPED'} onClick={()=>{setModalError('');setStopping(x)}}>Ngừng</button></td>
          </tr>})}
        </tbody></table>{!shown.length&&<p className="empty">Không có chương trình phù hợp.</p>}</div>
        <Pagination page={currentPage} size={10} total={shown.length} onChange={setPage}/>
      </>}
    </section>
    <section className="commerce-card promotion-history-card">
      <header className="panel-heading"><div><span>ĐỐI SOÁT</span><h2>Lịch sử sử dụng</h2></div><b>{historyShown.length} bản ghi</b></header>
      <div className="promotion-filters">
        <input aria-label="Tìm lịch sử sử dụng" placeholder="Mã, tên hoặc số tham chiếu…" value={historyQuery} onChange={e=>{setHistoryQuery(e.target.value);setHistoryPage(1)}}/>
        <select aria-label="Nguồn lịch sử" value={source} onChange={e=>{setSource(e.target.value);setHistoryPage(1)}}><option value="">Tất cả nguồn</option>{Object.entries(sourceLabels).map(([k,v])=><option value={k} key={k}>{v}</option>)}</select>
        <select aria-label="Thanh toán lịch sử" value={historyStatus} onChange={e=>{setHistoryStatus(e.target.value);setHistoryPage(1)}}><option value="">Tất cả đối soát</option>{Object.entries(usageLabels).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select>
        <button onClick={()=>{setHistoryQuery('');setSource('');setHistoryStatus('');setHistoryPage(1)}}>Xóa bộ lọc</button>
      </div>
      {loading?<p className="empty" role="status">Đang tải lịch sử…</p>:<>
        <div className="commerce-table-wrap"><table className="commerce-table history-table"><thead><tr>{['THỜI GIAN','CHƯƠNG TRÌNH','NGUỒN','THAM CHIẾU','ĐỐI SOÁT','GIẢM'].map(t=><th key={t}>{t}</th>)}</tr></thead><tbody>
          {historyShown.slice((currentHistoryPage-1)*10,currentHistoryPage*10).map(x=><tr key={x.Loai+'-'+x.ApDungKhuyenMaiID}><td>{time(x.NgayApDung)}</td><td><b className="promotion-code">{x.MaKhuyenMai}</b><small>{x.TenKhuyenMai}</small></td><td>{sourceLabels[x.Loai]||x.Loai}</td><td>#{x.ThamChieuID}</td><td><span className={'status-badge status-'+x.TinhTrangThanhToan.toLowerCase()}>{usageLabels[x.TinhTrangThanhToan]}</span></td><td className="numeric">{money(Number(x.SoTienGiam))}</td></tr>)}
        </tbody></table>{!historyShown.length&&<p className="empty">Chưa có lịch sử phù hợp.</p>}</div>
        <Pagination page={currentHistoryPage} size={10} total={historyShown.length} onChange={setHistoryPage}/>
      </>}
      <p className="capability-note">PT chưa có liên kết tới thanh toán: không tính vào thống kê đã thu tiền. Shop chỉ được tính khi có liên kết shopcheckout và thanh toán SUCCESS.</p>
    </section>
    {editing&&<Modal title={editing.KhuyenMaiID?'Sửa chương trình':'Tạo chương trình'} onClose={close}>
      <form className="promotion-form" onSubmit={submit}>
        {modalError&&<p className="catalog-error" role="alert">{modalError}</p>}
        <fieldset disabled={busy} className="promotion-form-body">
          <fieldset><legend>1. Thông tin chương trình</legend><label>Mã khuyến mãi<input name="code" required minLength={2} maxLength={50} defaultValue={editing.MaKhuyenMai}/></label><label>Tên chương trình<input name="name" required maxLength={150} defaultValue={editing.TenKhuyenMai}/></label></fieldset>
          <fieldset><legend>2. Loại giảm giá</legend><label>Chọn một loại<select value={discountType} onChange={e=>{setDiscountType(e.target.value);setDiscountValue('')}}><option value="percent">Giảm phần trăm</option><option value="amount">Giảm tiền cố định</option></select></label>
            <label>{discountType==='percent'?'Phần trăm (%)':'Số tiền (đ)'}<input type="number" required min="0.01" max={discountType==='percent'?100:9999999999999.99} step="0.01" value={discountValue} onChange={e=>setDiscountValue(e.target.value)}/></label>
            <label>Giá gói minh họa (đ)<input type="number" min="0" step="0.01" value={samplePrice} onChange={e=>setSamplePrice(e.target.value)}/></label>
            <p className="promotion-help">{validSample?'Giảm '+money(previewDiscount(sample,discountType==='percent'?discount:0,discountType==='amount'?discount:0))+', còn '+money(sample-previewDiscount(sample,discountType==='percent'?discount:0,discountType==='amount'?discount:0)): 'Nhập mức giảm hợp lệ để xem minh họa.'}<br/>% làm tròn đến đồng; tiền cố định và % đều không vượt giá gói.</p>
          </fieldset>
          <fieldset><legend>3. Điều kiện</legend><label className="promotion-wide">Mô tả điều kiện<textarea name="condition" rows={3} maxLength={10000} defaultValue={editing.DieuKien||''}/></label><p className="promotion-help promotion-wide">Đây là mô tả cho nhân viên. Backend hiện chỉ kiểm tra mã, trạng thái và thời gian; chưa thực thi giới hạn giá trị, số lần dùng hay phạm vi Shop/PT.</p></fieldset>
          <fieldset><legend>4. Thời gian · giờ Việt Nam</legend><label>Bắt đầu<input name="from" type="datetime-local" step="1" required defaultValue={dateInput(editing.NgayBatDau)}/></label><label>Kết thúc<input name="to" type="datetime-local" step="1" required defaultValue={dateInput(editing.NgayKetThuc)}/></label></fieldset>
          <fieldset><legend>5. Trạng thái</legend><label className="promotion-wide">Thiết lập<select name="status" defaultValue={editing.TrangThai||'ACTIVE'}><option value="ACTIVE">Bật chương trình · hiệu lực theo thời gian</option><option value="INACTIVE">Ngừng chương trình</option>{editing.TrangThai==='EXPIRED'&&<option value="EXPIRED">Đã đánh dấu hết hạn</option>}</select></label></fieldset>
        </fieldset>
        <footer className="modal-actions"><button type="button" disabled={busy} onClick={close}>Hủy</button><button className="primary" disabled={busy}>{busy?'Đang lưu…':'Lưu chương trình'}</button></footer>
      </form>
    </Modal>}
    {stopping&&<Modal title="Ngừng chương trình?" onClose={close}><div className="promotion-stop"><p>Ngừng <b>{stopping.MaKhuyenMai}</b> — {stopping.TenKhuyenMai}?</p><p>Mã sẽ không nhận lượt áp dụng mới. Lịch sử và giao dịch đã ghi nhận được giữ nguyên.</p>{modalError&&<p className="catalog-error" role="alert">{modalError}</p>}<footer className="modal-actions"><button disabled={busy} onClick={close}>Quay lại</button><button className="primary" disabled={busy} onClick={()=>void stop()}>{busy?'Đang ngừng…':'Xác nhận ngừng'}</button></footer></div></Modal>}
  </div>
}
