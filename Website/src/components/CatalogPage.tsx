import { Modal } from './AdminLayout'
import { Pagination } from './MemberUi'
import { money } from '../services/members'
import { catalogStatus } from '../services/catalog'
import {
  useCatalogPage,
  useProductImage,
  isProduct,
  rowId,
  rowName,
} from '../services/useCatalogPage'

export default function CatalogPage({ products }: { products: boolean }) {
  const {
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
  } = useCatalogPage(products)
  return (
    <div className="catalog-page member-api-page">
      <header className="catalog-heading">
        <div>
          <p className="catalog-eyebrow">QA PRO SHOP / QUẢN LÝ KINH DOANH</p>
          <h1>{products ? 'Danh sách sản phẩm' : 'Danh mục sản phẩm'}</h1>
          <p>
            {products
              ? 'Quản lý thông tin, giá bán và trạng thái kinh doanh.'
              : 'Sắp xếp sản phẩm theo danh mục và quản lý trạng thái hoạt động.'}
          </p>
        </div>
        <div className="catalog-actions">
          <button disabled={loading} onClick={reload}>
            ↻ Làm mới
          </button>
          <button
            disabled={loading || !!error || !filtered.length}
            onClick={download}
          >
            ↓ Xuất CSV
          </button>
          <button
            className="catalog-primary"
            disabled={loading || !!error || (products && !categories.length)}
            onClick={() => open('edit', null)}
          >
            ＋ Thêm {noun}
          </button>
        </div>
      </header>
      {notice && (
        <p className="catalog-notice" role="status">
          {notice}
        </p>
      )}
      {loading && (
        <p className="catalog-state" role="status">
          Đang tải {noun}…
        </p>
      )}
      {error && (
        <div className="catalog-error" role="alert">
          <p>{error}</p>
          <button onClick={reload}>Thử lại</button>
        </div>
      )}
      {!loading && !error && data && (
        <>
          <section className="catalog-stats">
            {stats.map(([label, value]) => (
              <article key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
              </article>
            ))}
          </section>
          {products && !categories.length && (
            <p className="catalog-notice">
              Hãy tạo danh mục tại mục “Danh mục” trước khi thêm sản phẩm.
            </p>
          )}
          <section className="catalog-filters" aria-label="Bộ lọc">
            <input
              aria-label={`Tìm ${noun}`}
              placeholder={`Tìm tên, mã hoặc mô tả ${noun}…`}
              value={search}
              onChange={(e) => changeSearch(e.target.value)}
            />
            {products && (
              <select
                aria-label="Danh mục"
                value={category}
                onChange={(e) => changeCategory(e.target.value)}
              >
                <option value="">Tất cả danh mục</option>
                {categories.map((c) => (
                  <option key={c.DanhMucID} value={c.DanhMucID}>
                    {c.TenDanhMuc}
                  </option>
                ))}
              </select>
            )}
            <select
              aria-label="Trạng thái"
              value={status}
              onChange={(e) => changeStatus(e.target.value)}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="ACTIVE">Đang hoạt động</option>
              <option value="INACTIVE">Ngừng hoạt động</option>
              {products && <option value="OUT_OF_STOCK">Hết hàng</option>}
            </select>
            <button onClick={resetFilters}>Xóa bộ lọc</button>
          </section>
          <section className="catalog-table-card">
            <div className="catalog-table-scroll">
              <table className="catalog-table">
                <thead>
                  <tr>
                    <th>{products ? 'Sản phẩm' : 'Danh mục'}</th>
                    <th>{products ? 'Danh mục' : 'Mô tả'}</th>
                    <th>{products ? 'Giá bán' : 'Số sản phẩm'}</th>
                    {products && <th>Đơn vị</th>}
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleRows.map((row) => (
                    <tr key={rowId(row)}>
                      <td>
                        <div className="catalog-identity">
                          {isProduct(row) && (
                            <ProductImage
                              key={row.HinhAnh}
                              source={row.HinhAnh}
                            />
                          )}
                          <div>
                            <strong>{rowName(row)}</strong>
                            <small>
                              {products ? 'SP' : 'DM'}
                              {String(rowId(row)).padStart(4, '0')}
                            </small>
                            {isProduct(row) && row.MoTa && (
                              <p
                                className="catalog-description"
                                title={row.MoTa}
                              >
                                {row.MoTa}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        {isProduct(row)
                          ? categoryName(row.DanhMucID)
                          : row.MoTa || 'Chưa có mô tả'}
                      </td>
                      <td>
                        {isProduct(row)
                          ? money(Number(row.GiaBan))
                          : countProducts(row.DanhMucID)}
                      </td>
                      {isProduct(row) && <td>{row.DonViTinh}</td>}
                      <td>
                        <span
                          className={`catalog-badge ${row.TrangThai.toLowerCase()}`}
                        >
                          {catalogStatus(row.TrangThai)}
                        </span>
                      </td>
                      <td>
                        <div className="catalog-row-actions">
                          <button
                            onClick={() => open('edit', row)}
                            aria-label={`Sửa ${rowName(row)}`}
                          >
                            Sửa
                          </button>
                          <button
                            className="catalog-danger"
                            disabled={!canDeleteRow(row)}
                            title={
                              !canDeleteRow(row)
                                ? 'Danh mục đang có sản phẩm'
                                : undefined
                            }
                            onClick={() => open('delete', row)}
                            aria-label={`Xóa ${rowName(row)}`}
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!filtered.length && (
              <p className="catalog-state">
                {items.length
                  ? 'Không có kết quả phù hợp với bộ lọc.'
                  : `Chưa có ${noun}.`}
              </p>
            )}
            <Pagination
              page={currentPage}
              total={filtered.length}
              size={10}
              onChange={setPage}
            />
          </section>
        </>
      )}
      {editor && (
        <Modal
          title={
            editor.action === 'delete'
              ? `Xóa ${noun}`
              : `${selected ? 'Chỉnh sửa' : 'Thêm'} ${noun}`
          }
          onClose={close}
        >
          {editor.action === 'delete' ? (
            <div className="catalog-form">
              <p>
                Bạn muốn xóa <strong>{selected && rowName(selected)}</strong>?
                Thao tác này không thể hoàn tác.
              </p>
              {saveError && (
                <p className="catalog-error" role="alert">
                  {saveError}
                </p>
              )}
              <footer>
                <button disabled={saving} onClick={close}>
                  Hủy
                </button>
                <button
                  className="catalog-danger"
                  disabled={saving}
                  onClick={() => void mutate()}
                >
                  {saving ? 'Đang xóa…' : 'Xác nhận xóa'}
                </button>
              </footer>
            </div>
          ) : (
            <form className="catalog-form" onSubmit={save}>
              <fieldset disabled={saving}>
                <label className="catalog-full">
                  Tên {noun} *
                  <input
                    autoFocus
                    name="name"
                    required
                    maxLength={products ? 150 : 100}
                    defaultValue={selected ? rowName(selected) : ''}
                  />
                </label>
                {products && (
                  <>
                    <label>
                      Danh mục *
                      <select
                        name="category"
                        required
                        defaultValue={product?.DanhMucID || ''}
                      >
                        <option value="" disabled>
                          Chọn danh mục
                        </option>
                        {categories.map((c) => (
                          <option key={c.DanhMucID} value={c.DanhMucID}>
                            {c.TenDanhMuc}
                            {c.TrangThai === 'INACTIVE'
                              ? ' (ngừng hoạt động)'
                              : ''}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Giá bán (VNĐ) *
                      <input
                        name="price"
                        type="number"
                        required
                        min="0"
                        max="9999999999999.99"
                        step="0.01"
                        defaultValue={product?.GiaBan ?? 0}
                      />
                    </label>
                    <label>
                      Đơn vị tính *
                      <input
                        name="unit"
                        required
                        maxLength={30}
                        defaultValue={product?.DonViTinh || 'Cái'}
                      />
                    </label>
                  </>
                )}
                <label>
                  Trạng thái
                  <select
                    name="status"
                    defaultValue={selected?.TrangThai || 'ACTIVE'}
                  >
                    <option value="ACTIVE">Đang hoạt động</option>
                    <option value="INACTIVE">Ngừng hoạt động</option>
                    {products && <option value="OUT_OF_STOCK">Hết hàng</option>}
                  </select>
                </label>
                {products && (
                  <label className="catalog-full">
                    Đường dẫn ảnh (HTTP/HTTPS)
                    <input
                      name="image"
                      type="url"
                      maxLength={255}
                      placeholder="https://…"
                      defaultValue={product?.HinhAnh || ''}
                    />
                  </label>
                )}
                <label className="catalog-full">
                  Mô tả
                  <textarea
                    name="description"
                    rows={4}
                    maxLength={10000}
                    defaultValue={selected?.MoTa || ''}
                  />
                </label>
              </fieldset>
              {saveError && (
                <p className="catalog-error" role="alert">
                  {saveError}
                </p>
              )}
              <footer>
                <button type="button" disabled={saving} onClick={close}>
                  Hủy
                </button>
                <button className="catalog-primary" disabled={saving}>
                  {saving ? 'Đang lưu…' : 'Lưu thay đổi'}
                </button>
              </footer>
            </form>
          )}
        </Modal>
      )}
    </div>
  )
}

function ProductImage({ source }: { source: string | null }) {
  const { showImage, onError } = useProductImage(source)
  if (!showImage)
    return (
      <span className="catalog-image-placeholder" aria-label="Chưa có ảnh">
        ▧
      </span>
    )
  return (
    <img
      className="catalog-image"
      src={source || undefined}
      alt=""
      loading="lazy"
      onError={onError}
    />
  )
}
