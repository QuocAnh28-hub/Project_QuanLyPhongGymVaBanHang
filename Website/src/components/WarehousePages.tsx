import { useRef, useState, type FormEvent } from 'react'
import { Modal } from './AdminLayout'
import { Pagination } from './MemberUi'
import { catalogRequest, searchText } from '../services/catalog'
import { exportCsv, formatDate, money, useMemberData } from '../services/members'
import { dateKey } from '../services/trainers'
import { loadWarehouse, receiptLabel, summarizeInbound, type Receipt } from '../services/warehouse'
import './CatalogPage.css'
import './WarehousePages.css'

type DraftLine = { key: number; product: string; quantity: string; price: string }
export default function WarehousePages({ mode }: { mode: 'inbound' | 'inventory' | 'history' }) {
  const { data, loading, error, reload } = useMemberData(loadWarehouse)
  const [search, setSearch] = useState(''), [warehouse, setWarehouse] = useState(''), [status, setStatus] = useState('')
  const [from, setFrom] = useState(''), [to, setTo] = useState(''), [page, setPage] = useState(1)
  const [create, setCreate] = useState(false), [selected, setSelected] = useState<number | null>(null)
  const [action, setAction] = useState<{ receipt: Receipt; status: string } | null>(null)
  const [draft, setDraft] = useState<DraftLine[]>([])
  const key = useRef(0), lock = useRef(false)
  const [busy, setBusy] = useState(false), [saveError, setSaveError] = useState(''), [notice, setNotice] = useState('')
  const receipts = data?.receipts || [], products = data?.products || [], warehouses = data?.warehouses || []
  const warehouseName = (id: number) => warehouses.find(w => Number(w.KhoID) === Number(id))?.TenKho || `Kho #${id}`
  const productName = (id: number) => products.find(p => Number(p.SanPhamID) === Number(id))?.TenSanPham || `Sản phẩm #${id}`
  const employeeName = (id: number) => data?.employees.find(e => Number(e.NhanVienID) === Number(id))?.HoTen || `Nhân viên #${id}`
  const invalidRange = !!from && !!to && from > to
  const shown = receipts.filter(r => !invalidRange && (!warehouse || Number(r.KhoID) === Number(warehouse)) && (!status || r.TrangThai === status) && (!from || dateKey(r.NgayNhap) >= from) && (!to || dateKey(r.NgayNhap) <= to) && searchText(`${r.PhieuNhapID} ${warehouseName(r.KhoID)} ${employeeName(r.NhanVienID)} ${r.GhiChu || ''}`).includes(searchText(search))).sort((a, b) => b.PhieuNhapID - a.PhieuNhapID)
  const stock = data ? summarizeInbound(data).filter(r => (!warehouse || Number(r.KhoID) === Number(warehouse)) && searchText(`${productName(r.SanPhamID)} ${r.SanPhamID} ${warehouseName(r.KhoID)}`).includes(searchText(search))) : []
  const total = mode === 'inventory' ? stock.length : shown.length
  const currentPage = Math.min(page, Math.max(1, Math.ceil(total / 10)))
  const slice = <T,>(rows: T[]) => rows.slice((currentPage - 1) * 10, currentPage * 10)
  const current = receipts.find(r => Number(r.PhieuNhapID) === Number(selected))
  const currentLines = data?.lines.filter(l => Number(l.PhieuNhapID) === Number(selected)) || []
  const addLine = () => setDraft(rows => [...rows, { key: ++key.current, product: '', quantity: '1', price: '0' }])
  const changeLine = (id: number, field: 'product' | 'quantity' | 'price', value: string) => setDraft(rows => rows.map(r => r.key === id ? { ...r, [field]: value } : r))
  const close = () => { if (!lock.current) { setCreate(false); setAction(null); setSelected(null) } }
  async function save(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault()
    if (lock.current) return
    const form = event ? new FormData(event.currentTarget) : null
    lock.current = true; setBusy(true); setSaveError(''); setNotice('')
    try {
      if (form) {
        if (!draft.length || new Set(draft.map(l => l.product)).size !== draft.length) throw new Error('Cần ít nhất một sản phẩm và không được chọn trùng.')
        const items = draft.map(l => {
          if (!l.product || !l.quantity.trim() || !l.price.trim() || !Number.isInteger(Number(l.quantity)) || Number(l.quantity) <= 0 || !Number.isFinite(Number(l.price)) || Number(l.price) < 0) throw new Error('Vui lòng kiểm tra sản phẩm, số lượng và đơn giá.')
          return { SanPhamID: Number(l.product), SoLuong: Number(l.quantity), DonGia: Number(l.price) }
        })
        await catalogRequest('phieunhap/with-items', { method: 'POST', body: JSON.stringify({ KhoID: Number(form.get('warehouse')), NhanVienID: Number(form.get('employee')), GhiChu: String(form.get('note') || '').trim(), items }) })
      } else if (action) {
        await catalogRequest(`phieunhap/${action.receipt.PhieuNhapID}/status`, { method: 'POST', body: JSON.stringify({ TrangThai: action.status }) })
      } else return
      setCreate(false); setAction(null); setSelected(null); setNotice('Đã lưu phiếu nhập.'); reload()
    } catch (e) { setSaveError(e instanceof Error ? e.message : 'Không thể lưu phiếu nhập.') }
    finally { lock.current = false; setBusy(false) }
  }
  function download() {
    exportCsv(`${mode}.csv`, mode === 'inventory'
      ? [['Kho', 'Sản phẩm', 'Lượng đã nhập', 'Giá trị nhập'], ...stock.map(r => [warehouseName(r.KhoID), productName(r.SanPhamID), r.quantity, r.value])]
      : [['Phiếu', 'Ngày lập', 'Kho', 'Nhân viên', 'Tổng tiền', 'Trạng thái', 'Ghi chú'], ...shown.map(r => [r.PhieuNhapID, formatDate(r.NgayNhap, true), warehouseName(r.KhoID), employeeName(r.NhanVienID), r.TongTien, receiptLabel(r.TrangThai), r.GhiChu || ''])])
  }
  return <div className="catalog-page warehouse-api-page member-api-page">
    <header className="catalog-heading"><div><p className="catalog-eyebrow">VẬN HÀNH / KHO HÀNG</p><h1>{mode === 'inbound' ? 'Quản lý nhập kho' : mode === 'inventory' ? 'Tồn kho & tổng hợp nhập hàng' : 'Lịch sử kho'}</h1><p>{mode === 'history' ? 'Tra cứu phiếu nhập đã ghi nhận và trạng thái hiện tại.' : 'Theo dõi kho, sản phẩm và phiếu nhập hàng.'}</p></div><div className="catalog-actions"><button disabled={loading} onClick={reload}>↻ Làm mới</button><button disabled={loading || !!error || !total} onClick={download}>↓ Xuất CSV</button>{mode === 'inbound' && <button className="catalog-primary" disabled={loading || !!error} onClick={() => { setDraft([{ key: ++key.current, product: '', quantity: '1', price: '0' }]); setSaveError(''); setCreate(true) }}>＋ Tạo phiếu nhập</button>}</div></header>
    {mode === 'inventory' && <p className="catalog-notice">Chưa có số dư tồn thực tế hoặc dữ liệu xuất kho. Bảng dưới chỉ tổng hợp hàng từ phiếu đã nhập kho, chưa trừ xuất bán, điều chuyển hay kiểm kê.</p>}
    {mode === 'history' && <p className="catalog-notice">Lịch sử hiện gồm các phiếu nhập và trạng thái hiện tại; chưa có nhật ký xuất kho, điều chuyển hoặc thời điểm từng lần đổi trạng thái.</p>}
    {notice && <p className="catalog-notice" role="status">{notice}</p>}{loading && <p className="catalog-state" role="status">Đang tải dữ liệu kho…</p>}{error && <div className="catalog-error" role="alert"><p>{error}</p><button onClick={reload}>Thử lại</button></div>}
    {!loading && !error && data && <>
      <section className="catalog-stats">{[['Kho đang hoạt động', warehouses.filter(w => w.TrangThai === 'ACTIVE').length], ['Chờ nhập kho', receipts.filter(r => r.TrangThai === 'PENDING').length], ['Đã nhập kho', receipts.filter(r => r.TrangThai === 'COMPLETED').length], ['Đã hủy', receipts.filter(r => r.TrangThai === 'CANCELLED').length]].map(([label, count]) => <article key={label}><span>{label}</span><strong>{count}</strong></article>)}</section>
      <section className="catalog-filters"><input aria-label="Tìm kiếm kho" placeholder={mode === 'inventory' ? 'Tên hoặc mã sản phẩm, tên kho…' : 'Mã phiếu, kho, nhân viên, ghi chú…'} value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} /><select aria-label="Kho" value={warehouse} onChange={e => { setWarehouse(e.target.value); setPage(1) }}><option value="">Tất cả kho</option>{warehouses.map(w => <option key={w.KhoID} value={w.KhoID}>{w.TenKho}</option>)}</select>
        {mode !== 'inventory' && <><select aria-label="Trạng thái phiếu" value={status} onChange={e => { setStatus(e.target.value); setPage(1) }}><option value="">Tất cả trạng thái</option>{['PENDING', 'COMPLETED', 'CANCELLED'].map(s => <option key={s} value={s}>{receiptLabel(s)}</option>)}</select><label>Từ ngày<input type="date" value={from} onChange={e => { setFrom(e.target.value); setPage(1) }} /></label><label>Đến ngày<input type="date" value={to} onChange={e => { setTo(e.target.value); setPage(1) }} /></label></>}
        <button onClick={() => { setSearch(''); setWarehouse(''); setStatus(''); setFrom(''); setTo(''); setPage(1) }}>Xóa bộ lọc</button>
      </section>{invalidRange && <p className="catalog-error" role="alert">Khoảng ngày không hợp lệ.</p>}
      <section className="catalog-table-card"><div className="catalog-table-scroll"><table className="catalog-table"><thead><tr>{(mode === 'inventory' ? ['Sản phẩm', 'Kho', 'Đơn vị', 'Lượng đã nhập', 'Giá trị nhập', 'Tồn thực tế'] : ['Phiếu / Ngày lập', 'Kho', 'Nhân viên', 'Tổng tiền', 'Trạng thái', 'Thao tác']).map(h => <th key={h}>{h}</th>)}</tr></thead><tbody>
        {mode === 'inventory' ? slice(stock).map(r => <tr key={`${r.KhoID}:${r.SanPhamID}`}><td><strong>{productName(r.SanPhamID)}</strong><small>SP #{r.SanPhamID}</small></td><td>{warehouseName(r.KhoID)}</td><td>{products.find(p => Number(p.SanPhamID) === Number(r.SanPhamID))?.DonViTinh || '—'}</td><td>{r.quantity}</td><td>{money(r.value)}</td><td>Chưa có dữ liệu</td></tr>) : slice(shown).map(r => <tr key={r.PhieuNhapID}><td><strong>PN #{r.PhieuNhapID}</strong><small>{formatDate(r.NgayNhap, true)}</small></td><td>{warehouseName(r.KhoID)}</td><td>{employeeName(r.NhanVienID)}</td><td>{money(Number(r.TongTien))}</td><td><span className={`catalog-badge ${r.TrangThai.toLowerCase()}`}>{receiptLabel(r.TrangThai)}</span></td><td><button onClick={() => { setSelected(r.PhieuNhapID); setSaveError('') }}>Chi tiết →</button></td></tr>)}
      </tbody></table></div>{!total && <p className="catalog-state">Không có dữ liệu phù hợp.</p>}<Pagination page={currentPage} total={total} size={10} onChange={setPage} /></section>
    </>}
    {current && !action && <Modal title={`Phiếu nhập #${current.PhieuNhapID}`} onClose={close}><div className="warehouse-detail"><p>{warehouseName(current.KhoID)} · {employeeName(current.NhanVienID)}</p><p>{formatDate(current.NgayNhap, true)} · {receiptLabel(current.TrangThai)}</p><div className="catalog-table-scroll"><table className="catalog-table"><thead><tr><th>Sản phẩm</th><th>Số lượng</th><th>Đơn giá</th><th>Thành tiền</th></tr></thead><tbody>{currentLines.map(l => <tr key={l.ChiTietPhieuNhapID}><td>{productName(l.SanPhamID)}</td><td>{l.SoLuong}</td><td>{money(Number(l.DonGia))}</td><td>{money(Number(l.ThanhTien))}</td></tr>)}</tbody></table></div>{!currentLines.length && <p>Phiếu chưa có dòng hàng.</p>}<h3>Tổng tiền: {money(Number(current.TongTien))}</h3><p className="warehouse-note">{current.GhiChu || 'Chưa có ghi chú.'}</p>{mode === 'inbound' && current.TrangThai === 'PENDING' && <div className="catalog-actions"><button disabled={!currentLines.length} className="catalog-primary" onClick={() => setAction({ receipt: current, status: 'COMPLETED' })}>Xác nhận đã nhập kho</button><button disabled={!currentLines.length} className="catalog-danger" onClick={() => setAction({ receipt: current, status: 'CANCELLED' })}>Hủy phiếu</button></div>}</div></Modal>}
    {action && <Modal title="Xác nhận phiếu nhập" onClose={close}><p>Chuyển phiếu #{action.receipt.PhieuNhapID} sang “{receiptLabel(action.status)}”? {action.status === 'COMPLETED' && 'Chỉ xác nhận khi hàng đã được kiểm đếm và nhận đủ.'}</p>{saveError && <p className="catalog-error" role="alert">{saveError}</p>}<div className="catalog-actions"><button disabled={busy} onClick={() => setAction(null)}>Quay lại</button><button disabled={busy} className="catalog-primary" onClick={() => void save()}>{busy ? 'Đang lưu…' : 'Xác nhận'}</button></div></Modal>}
    {create && <Modal title="Tạo phiếu nhập kho" onClose={close}><form className="catalog-form" onSubmit={save}><fieldset disabled={busy}><label>Kho nhận *<select name="warehouse" required defaultValue=""><option value="" disabled>Chọn kho</option>{warehouses.filter(w => w.TrangThai === 'ACTIVE').map(w => <option key={w.KhoID} value={w.KhoID}>{w.TenKho}</option>)}</select></label><label>Nhân viên nhận *<select name="employee" required defaultValue=""><option value="" disabled>Chọn nhân viên</option>{data?.employees.filter(e => e.TrangThai === 'ACTIVE').map(e => <option key={e.NhanVienID} value={e.NhanVienID}>{e.HoTen}</option>)}</select></label><div className="catalog-full warehouse-lines">{draft.map((l, i) => <div className="warehouse-draft-line" key={l.key}><label>Sản phẩm {i + 1}<select required value={l.product} onChange={e => changeLine(l.key, 'product', e.target.value)}><option value="" disabled>Chọn sản phẩm</option>{products.map(p => <option key={p.SanPhamID} value={p.SanPhamID}>{p.TenSanPham}</option>)}</select></label><label>Số lượng<input type="number" required min="1" max="1000000" step="1" value={l.quantity} onChange={e => changeLine(l.key, 'quantity', e.target.value)} /></label><label>Đơn giá (VNĐ)<input type="number" required min="0" step="0.01" value={l.price} onChange={e => changeLine(l.key, 'price', e.target.value)} /></label><button type="button" disabled={draft.length === 1} onClick={() => setDraft(rows => rows.filter(row => row.key !== l.key))}>Xóa dòng</button></div>)}<button type="button" disabled={draft.length >= 100} onClick={addLine}>＋ Thêm dòng hàng</button></div><label className="catalog-full">Ghi chú<textarea name="note" maxLength={500} rows={3} /></label></fieldset><p>Tổng dự kiến: <strong>{money(draft.reduce((sum, l) => sum + Number(l.quantity || 0) * Number(l.price || 0), 0))}</strong></p><p className="warehouse-help">Phiếu mới ở trạng thái chờ nhập. Xác nhận sau khi nhận và kiểm đếm hàng.</p>{saveError && <p className="catalog-error" role="alert">{saveError}</p>}<footer><button type="button" disabled={busy} onClick={close}>Hủy</button><button className="catalog-primary" disabled={busy}>{busy ? 'Đang lưu…' : 'Tạo phiếu nhập'}</button></footer></form></Modal>}
  </div>
}
