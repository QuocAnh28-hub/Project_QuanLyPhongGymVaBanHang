import { useRef, useState, type FormEvent } from 'react'
import { searchText } from './catalog'
import { exportCsv, formatDate, useMemberData } from './members'
import { dateKey } from './trainers'
import { createReceipt, setReceiptStatus, loadWarehouse, receiptLabel, summarizeInbound, type Receipt, type ReceiptDraftLine } from './warehouse'

export type WarehouseMode = 'inbound' | 'inventory' | 'history'
type DraftLine = ReceiptDraftLine & { key: number }
export function useWarehousePage(mode: WarehouseMode) {
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
        await createReceipt(form, draft)
      } else if (action) {
        await setReceiptStatus(action.receipt.PhieuNhapID, action.status)
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
  const changeSearch = (value: string) => { setSearch(value); setPage(1) }
  const changeWarehouse = (value: string) => { setWarehouse(value); setPage(1) }
  const changeStatus = (value: string) => { setStatus(value); setPage(1) }
  const changeFrom = (value: string) => { setFrom(value); setPage(1) }
  const changeTo = (value: string) => { setTo(value); setPage(1) }
  const resetFilters = () => { setSearch(''); setWarehouse(''); setStatus(''); setFrom(''); setTo(''); setPage(1) }
  const stats = [['Kho đang hoạt động', warehouses.filter(w => w.TrangThai === 'ACTIVE').length], ['Chờ nhập kho', receipts.filter(r => r.TrangThai === 'PENDING').length], ['Đã nhập kho', receipts.filter(r => r.TrangThai === 'COMPLETED').length], ['Đã hủy', receipts.filter(r => r.TrangThai === 'CANCELLED').length]]
  const visibleStock = slice(stock)
  const visibleReceipts = slice(shown)
  const activeWarehouses = warehouses.filter(w => w.TrangThai === 'ACTIVE')
  const activeEmployees = data?.employees.filter(e => e.TrangThai === 'ACTIVE') || []
  const draftTotal = draft.reduce((sum, l) => sum + Number(l.quantity || 0) * Number(l.price || 0), 0)
  const productUnit = (id: number) => products.find(p => Number(p.SanPhamID) === Number(id))?.DonViTinh || '—'
  const openCreate = () => { setDraft([{ key: ++key.current, product: '', quantity: '1', price: '0' }]); setSaveError(''); setCreate(true) }
  const openReceipt = (id: number) => { setSelected(id); setSaveError('') }
  const removeLine = (id: number) => setDraft(rows => rows.filter(row => row.key !== id))
  const canUpdateReceipt = mode === 'inbound' && current?.TrangThai === 'PENDING'
  return {
    changeSearch, changeWarehouse, changeStatus, changeFrom, changeTo, resetFilters,
    stats, visibleStock, visibleReceipts, activeWarehouses, activeEmployees, draftTotal,
    productUnit, openCreate, openReceipt, removeLine, canUpdateReceipt, data,
    loading, error, reload, search, warehouse, status,
    from, to, setPage, create, action, setAction,
    draft, busy, saveError, notice, products, warehouses,
    warehouseName, productName, employeeName, invalidRange, total, currentPage,
    current, currentLines, addLine, changeLine, close, save,
    download
  }
}
