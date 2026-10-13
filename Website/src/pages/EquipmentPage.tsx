import { useEffect, useMemo, useRef, useState } from 'react'
import { Modal, MetricCard } from '../components/AdminLayout'
import ImageInput from '../components/ImageInput'
import { searchText } from '../services/catalog'
import { resolveBackendImageUrl } from '../services/images'
import { deleteEquipment, equipmentGroups, equipmentStatuses, getEquipment, saveEquipment, type Equipment } from '../services/equipment'
import './EquipmentPage.css'

export default function EquipmentPage() {
  const [items, setItems] = useState<Equipment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [search, setSearch] = useState('')
  const [group, setGroup] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [editor, setEditor] = useState<{ row?: Equipment } | null>(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [saveError, setSaveError] = useState('')
  const busy = useRef(false)
  async function load(signal?: AbortSignal) {
    setLoading(true)
    setError('')
    try { const rows = await getEquipment(signal); if (!signal?.aborted) setItems(rows) }
    catch (e) { if (!signal?.aborted) setError(e instanceof Error ? e.message : 'Không tải được máy tập.') }
    finally { if (!signal?.aborted) setLoading(false) }
  }
  useEffect(() => {
    const controller = new AbortController()
    // oxlint-disable-next-line react/set-state-in-effect -- initialize the asynchronous server request; refresh also resets its state
    void load(controller.signal)
    return () => controller.abort()
  }, [])
  const filtered = useMemo(() => items.filter(row =>
    (!group || row.NhomMay === group) && (!status || row.TrangThai === status) &&
    searchText(`${row.MaMay} ${row.TenMay} ${row.NhomCo} ${row.ViTri}`).includes(searchText(search))
  ), [items, search, group, status])
  const pages = Math.max(1, Math.ceil(filtered.length / 10))
  const currentPage = Math.min(page, pages)
  const rows = filtered.slice((currentPage - 1) * 10, currentPage * 10)
  function open(row?: Equipment) { setSaveError(''); setUploading(false); setEditor({ row }) }
  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy.current || uploading) return
    const form = new FormData(event.currentTarget)
    const text = (key: string) => String(form.get(key) || '').trim()
    const payload: Omit<Equipment, 'MayTapID'> = {
      MaMay: text('MaMay'), TenMay: text('TenMay'), NhomMay: text('NhomMay') as Equipment['NhomMay'],
      NhomCo: text('NhomCo'), MoTa: text('MoTa'), HinhAnh: text('HinhAnh') || null,
      SoLuong: Number(text('SoLuong')), ViTri: text('ViTri'), TrangThai: text('TrangThai') as Equipment['TrangThai'],
    }
    busy.current = true; setSaving(true); setSaveError(''); setNotice('')
    try {
      await saveEquipment(payload, editor?.row?.MayTapID)
      setEditor(null); setNotice('Đã lưu máy tập. Các máy đang hoạt động được hiển thị trên Mobile.')
      await load()
    } catch (e) { setSaveError(e instanceof Error ? e.message : 'Không lưu được máy tập.') }
    finally { busy.current = false; setSaving(false) }
  }
  async function remove(row: Equipment) {
    if (busy.current || !window.confirm(`Xóa ${row.TenMay}? Máy sẽ được gỡ khỏi danh mục và Mobile.`)) return
    busy.current = true; setSaving(true); setNotice(''); setError('')
    try { await deleteEquipment(row.MayTapID); setNotice('Đã xóa máy tập.'); await load() }
    catch (e) { setError(e instanceof Error ? e.message : 'Không xóa được máy tập.') }
    finally { busy.current = false; setSaving(false) }
  }
  return <div className="admin-page equipment-page">
    <header className="equipment-heading"><div><p>VẬN HÀNH CHÍNH / THIẾT BỊ PHÒNG TẬP</p><h1>Quản lý máy tập</h1><span>Quản lý danh mục và nội dung giới thiệu máy tập cho khách hàng.</span></div>
      <div className="equipment-actions"><button disabled={loading || saving} onClick={() => void load()}>↻ Làm mới</button><button className="equipment-primary" disabled={saving} onClick={() => open()}>＋ Thêm máy tập</button></div>
    </header>
    <section className="metrics-grid">
      <MetricCard label="LOẠI MÁY" value={String(items.length)} note="Danh mục thiết bị" />
      <MetricCard label="TỔNG SỐ MÁY" value={String(items.reduce((sum, row) => sum + row.SoLuong, 0))} note="Số lượng trong danh mục" />
      <MetricCard label="ĐANG HOẠT ĐỘNG" value={String(items.filter(row => row.TrangThai === 'ACTIVE').length)} note="Loại máy hiển thị trên Mobile" tone="mint" />
      <MetricCard label="ĐANG BẢO TRÌ" value={String(items.filter(row => row.TrangThai === 'MAINTENANCE').length)} note="Loại máy tạm ngừng phục vụ" tone="error" />
    </section>
    {notice && <p className="equipment-notice" role="status">{notice}</p>}
    {error && <p className="equipment-error" role="alert">{error} <button disabled={loading || saving} onClick={() => void load()}>Thử lại</button></p>}
    <div className="equipment-filters">
      <input aria-label="Tìm máy tập" placeholder="Tìm tên, mã máy, nhóm cơ hoặc vị trí…" value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
      <select aria-label="Nhóm máy" value={group} onChange={e => { setGroup(e.target.value); setPage(1) }}><option value="">Tất cả nhóm máy</option>{Object.entries(equipmentGroups).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
      <select aria-label="Trạng thái" value={status} onChange={e => { setStatus(e.target.value); setPage(1) }}><option value="">Tất cả trạng thái</option>{Object.entries(equipmentStatuses).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
    </div>
    {loading ? <p role="status">Đang tải máy tập…</p> : <div className="equipment-table-wrap"><table className="equipment-table"><thead><tr><th>Máy tập</th><th>Nhóm / Nhóm cơ</th><th>Giới thiệu</th><th>Số lượng / Vị trí</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody>
      {rows.map(row => <tr key={row.MayTapID}><td><div className="equipment-identity">{row.HinhAnh ? <img src={resolveBackendImageUrl(row.HinhAnh)} alt={row.TenMay} /> : <span aria-hidden="true">◇</span>}<div><b>{row.TenMay}</b><small>{row.MaMay}</small></div></div></td><td><b>{equipmentGroups[row.NhomMay]}</b><small>{row.NhomCo || 'Chưa cập nhật'}</small></td><td><p className="equipment-description" title={row.MoTa}>{row.MoTa}</p></td><td><b>{row.SoLuong} máy</b><small>{row.ViTri || 'Chưa cập nhật'}</small></td><td><span className={`equipment-status ${row.TrangThai.toLowerCase()}`}>{equipmentStatuses[row.TrangThai]}</span></td><td><div className="equipment-row-actions"><button disabled={saving} onClick={() => open(row)}>Sửa</button><button className="equipment-delete" disabled={saving} onClick={() => void remove(row)}>Xóa</button></div></td></tr>)}
    </tbody></table>{!rows.length && <p className="equipment-empty">Không có máy tập phù hợp.</p>}
      <div className="equipment-pagination"><span>{filtered.length} loại máy · Trang {currentPage}/{pages}</span><div><button disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>‹ Trước</button><button disabled={currentPage === pages} onClick={() => setPage(currentPage + 1)}>Sau ›</button></div></div>
    </div>}
    {editor && <Modal title={editor.row ? 'Chỉnh sửa máy tập' : 'Thêm máy tập'} onClose={() => { if (!saving && !uploading) setEditor(null) }}>
      <form className="equipment-form" onSubmit={event => void save(event)}><fieldset disabled={saving}>
        <label>Mã máy<input name="MaMay" required maxLength={60} pattern="[a-zA-Z0-9_-]+" placeholder="VD: treadmill" defaultValue={editor.row?.MaMay} /></label>
        <label>Tên máy<input name="TenMay" required maxLength={150} defaultValue={editor.row?.TenMay} /></label>
        <label>Nhóm máy<select name="NhomMay" defaultValue={editor.row?.NhomMay || 'STRENGTH'}>{Object.entries(equipmentGroups).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label>Nhóm cơ<input name="NhomCo" maxLength={200} placeholder="VD: Ngực · Vai · Tay sau" defaultValue={editor.row?.NhomCo} /></label>
        <label>Số lượng<input name="SoLuong" type="number" required min={1} max={10000} step={1} defaultValue={editor.row?.SoLuong || 1} /></label>
        <label>Vị trí<input name="ViTri" maxLength={150} placeholder="VD: Tầng 2 · Khu sức mạnh" defaultValue={editor.row?.ViTri} /></label>
        <label className="equipment-full">Mô tả giới thiệu<textarea name="MoTa" required maxLength={5000} rows={4} defaultValue={editor.row?.MoTa} /></label>
        <label className="equipment-full">Trạng thái<select name="TrangThai" defaultValue={editor.row?.TrangThai || 'ACTIVE'}>{Object.entries(equipmentStatuses).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <ImageInput name="HinhAnh" value={editor.row?.HinhAnh} endpoint="maytap/upload-image" onBusyChange={setUploading} />
      </fieldset>
      <p className="equipment-form-note">Chỉ máy đang hoạt động được giới thiệu trên trang chủ Mobile.</p>
      {saveError && <p className="equipment-error" role="alert">{saveError}</p>}
      <div className="equipment-actions"><button type="button" disabled={saving || uploading} onClick={() => setEditor(null)}>Hủy</button><button type="submit" className="equipment-primary" disabled={saving || uploading}>{saving ? 'Đang lưu…' : 'Lưu máy tập'}</button></div>
      </form>
    </Modal>}
  </div>
}
