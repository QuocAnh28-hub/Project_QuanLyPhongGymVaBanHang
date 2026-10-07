import { useRef, useState, type FormEvent } from 'react'
import { resolveBackendImageUrl } from './images'
import { exportCsv, useMemberData } from './members'
import {
  saveCatalogItem,
  deleteCatalogItem,
  catalogStatus,
  loadCatalog,
  searchText,
  type Category,
  type Product,
} from './catalog'

type Row = Product | Category
type Editor = { action: 'edit' | 'delete'; row: Row | null }
export const isProduct = (row: Row): row is Product => 'SanPhamID' in row
export const rowId = (row: Row) =>
  isProduct(row) ? row.SanPhamID : row.DanhMucID
export const rowName = (row: Row) =>
  isProduct(row) ? row.TenSanPham : row.TenDanhMuc

export function useCatalogPage(products: boolean) {
  const { data, loading, error, reload } = useMemberData(loadCatalog)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [category, setCategory] = useState('')
  const [page, setPage] = useState(1)
  const [editor, setEditor] = useState<Editor | null>(null)
  const [saving, setSaving] = useState(false)
  const savingRef = useRef(false)
  const [saveError, setSaveError] = useState('')
  const [notice, setNotice] = useState('')
  const noun = products ? 'sản phẩm' : 'danh mục'
  const categories = data?.categories || []
  const items: Row[] = products ? data?.products || [] : categories
  const categoryName = (id: number) =>
    categories.find((c) => Number(c.DanhMucID) === Number(id))?.TenDanhMuc ||
    `Danh mục #${id}`
  const countProducts = (id: number) =>
    data?.products.filter((p) => Number(p.DanhMucID) === Number(id)).length || 0
  const filtered = items
    .filter(
      (row) =>
        searchText(`${rowName(row)} ${rowId(row)} ${row.MoTa || ''}`).includes(
          searchText(search)
        ) &&
        (!status || row.TrangThai === status) &&
        (!category ||
          (isProduct(row) && Number(row.DanhMucID) === Number(category)))
    )
    .sort((a, b) => rowId(b) - rowId(a))
  const currentPage = Math.min(
    page,
    Math.max(1, Math.ceil(filtered.length / 10))
  )
  const open = (action: Editor['action'], row: Row | null) => {
    setSaveError('')
    setEditor({ action, row })
  }
  const close = () => {
    if (!savingRef.current) setEditor(null)
  }

  async function mutate(form?: FormData) {
    if (!editor || savingRef.current) return
    savingRef.current = true
    setSaving(true)
    setSaveError('')
    setNotice('')
    try {
      const id = editor.row ? rowId(editor.row) : undefined
      if (editor.action === 'delete' && id !== undefined)
        await deleteCatalogItem(products, id)
      else if (form) await saveCatalogItem(products, form, id)
      else return
      setEditor(null)
      setNotice(
        editor.action === 'delete' ? `Đã xóa ${noun}.` : `Đã lưu ${noun}.`
      )
      reload()
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Không thể lưu thay đổi.')
    } finally {
      savingRef.current = false
      setSaving(false)
    }
  }
  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    try {
      void mutate(new FormData(event.currentTarget))
    } catch (e) {
      setSaveError(
        e instanceof Error ? e.message : 'Vui lòng kiểm tra thông tin.'
      )
    }
  }
  function download() {
    const rows = filtered.map((row) =>
      isProduct(row)
        ? [
            row.SanPhamID,
            row.TenSanPham,
            categoryName(row.DanhMucID),
            row.GiaBan,
            row.DonViTinh,
            catalogStatus(row.TrangThai),
          ]
        : [
            row.DanhMucID,
            row.TenDanhMuc,
            row.MoTa || '',
            countProducts(row.DanhMucID),
            catalogStatus(row.TrangThai),
          ]
    )
    exportCsv(products ? 'san-pham.csv' : 'danh-muc.csv', [
      products
        ? [
            'Mã',
            'Tên sản phẩm',
            'Danh mục',
            'Giá bán',
            'Đơn vị tính',
            'Trạng thái',
          ]
        : ['Mã', 'Tên danh mục', 'Mô tả', 'Số sản phẩm', 'Trạng thái'],
      ...rows,
    ])
  }
  const selected = editor?.row
  const product = selected && isProduct(selected) ? selected : null

  const changeSearch = (value: string) => {
    setSearch(value)
    setPage(1)
  }
  const changeStatus = (value: string) => {
    setStatus(value)
    setPage(1)
  }
  const changeCategory = (value: string) => {
    setCategory(value)
    setPage(1)
  }
  const resetFilters = () => {
    setSearch('')
    setStatus('')
    setCategory('')
    setPage(1)
  }
  const stats = [
    [`Tổng ${noun}`, items.length],
    ['Đang hoạt động', items.filter((r) => r.TrangThai === 'ACTIVE').length],
    ['Ngừng hoạt động', items.filter((r) => r.TrangThai === 'INACTIVE').length],
    [
      products ? 'Hết hàng' : 'Sản phẩm đã phân loại',
      products
        ? items.filter((r) => r.TrangThai === 'OUT_OF_STOCK').length
        : data?.products.length || 0,
    ],
  ]
  const canDeleteRow = (row: Row) =>
    isProduct(row) || countProducts(row.DanhMucID) === 0
  const visibleRows = filtered.slice((currentPage - 1) * 10, currentPage * 10)
  return {
    changeSearch,
    changeStatus,
    changeCategory,
    resetFilters,
    stats,
    visibleRows,
    data,
    loading,
    error,
    reload,
    search,
    status,
    category,
    setPage,
    editor,
    saving,
    saveError,
    notice,
    noun,
    categories,
    items,
    categoryName,
    countProducts,
    filtered,
    currentPage,
    open,
    close,
    mutate,
    save,
    download,
    selected,
    product,
    canDeleteRow,
  }
}

export function useProductImage(source: string | null) {
  const [failed, setFailed] = useState(false)
  return {
    source: resolveBackendImageUrl(source),
    showImage: !!resolveBackendImageUrl(source) && !failed,
    onError: () => setFailed(true),
  }
}
