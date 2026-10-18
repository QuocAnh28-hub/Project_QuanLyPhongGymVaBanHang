import { useRef, useState, type FormEvent } from 'react'
import { Modal } from '../components/AdminLayout'
import { Pagination } from '../components/MemberUi'
import { searchText } from '../services/catalog'
import { exportCsv, formatDate, useMemberData } from '../services/members'
import { dateKey } from '../services/trainers'
import {
  employeeRequest,
  employeeSession,
  employeeStatus,
  loadEmployees,
  type Employee,
} from '../services/employees'

type Editor = { type: 'profile' | 'access'; row: Employee | null }
export default function Employees() {
  const { data, loading, error, reload } = useMemberData(loadEmployees)
  const [search, setSearch] = useState(''),
    [role, setRole] = useState(''),
    [status, setStatus] = useState(''),
    [page, setPage] = useState(1)
  const [editor, setEditor] = useState<Editor | null>(null)
  const [busy, setBusy] = useState(false),
    [saveError, setSaveError] = useState(''),
    [notice, setNotice] = useState('')
  const lock = useRef(false)
  const rows = data || []
  const self = employeeSession()?.account.TaiKhoanID
  const filtered = rows.filter(
    (e) =>
      (!role || e.VaiTro === role) &&
      (!status || e.TrangThai === status) &&
      searchText(
        `${e.NhanVienID} ${e.HoTen} ${e.SoDienThoai || ''} ${e.EmailDangNhap} ${e.ChucVu || ''}`
      ).includes(searchText(search))
  )
  const currentPage = Math.min(
    page,
    Math.max(1, Math.ceil(filtered.length / 10))
  )
  const open = (type: Editor['type'], row: Employee | null) => {
    setSaveError('')
    setEditor({ type, row })
  }
  const close = () => {
    if (!lock.current) setEditor(null)
  }
  const current = editor?.row
  const isSelf = Number(current?.TaiKhoanID) === Number(self)
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!editor || lock.current) return
    const form = new FormData(event.currentTarget)
    const payload = Object.fromEntries(form.entries())
    if (editor.type === 'profile')
      payload.HoTen = String(payload.HoTen || '').trim()
    lock.current = true
    setBusy(true)
    setSaveError('')
    setNotice('')
    try {
      const path = editor.row
        ? `/${editor.row.NhanVienID}${editor.type === 'access' ? '/access' : ''}`
        : ''
      await employeeRequest(path, {
        method: editor.row ? 'PUT' : 'POST',
        body: JSON.stringify(payload),
      })
      setEditor(null)
      setNotice(
        editor.type === 'access'
          ? 'Đã cập nhật quyền và trạng thái tài khoản.'
          : 'Đã lưu hồ sơ nhân viên.'
      )
      reload()
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Không thể lưu nhân viên.')
    } finally {
      lock.current = false
      setBusy(false)
    }
  }
  return (
    <div className="catalog-page employees-api-page member-api-page">
      <header className="catalog-heading">
        <div>
          <p className="catalog-eyebrow">QUẢN TRỊ / NHÂN SỰ</p>
          <h1>Quản lý nhân viên & phân quyền</h1>
          <p>Quản lý hồ sơ nhân sự, tài khoản đăng nhập và vai trò hệ thống.</p>
        </div>
        <div className="catalog-actions">
          <button disabled={loading} onClick={reload}>
            ↻ Làm mới
          </button>
          <button
            disabled={loading || !!error || !filtered.length}
            onClick={() =>
              exportCsv('nhan-vien.csv', [
                [
                  'Mã',
                  'Họ tên',
                  'Chức vụ',
                  'Email đăng nhập',
                  'Điện thoại',
                  'Vai trò',
                  'Hồ sơ',
                  'Tài khoản',
                ],
                ...filtered.map((e) => [
                  e.NhanVienID,
                  e.HoTen,
                  e.ChucVu || '',
                  e.EmailDangNhap,
                  e.SoDienThoai || '',
                  e.VaiTro,
                  employeeStatus(e.TrangThai),
                  employeeStatus(e.TrangThaiTaiKhoan),
                ]),
              ])
            }
          >
            ↓ Xuất CSV
          </button>
          <button
            className="catalog-primary"
            disabled={loading || !!error}
            onClick={() => open('profile', null)}
          >
            ＋ Thêm nhân viên
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
          Đang tải nhân viên…
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
            {[
              ['Tổng nhân viên', rows.length],
              [
                'Hồ sơ hoạt động',
                rows.filter((e) => e.TrangThai === 'ACTIVE').length,
              ],
              [
                'Quản trị viên',
                rows.filter((e) => e.VaiTro === 'ADMIN').length,
              ],
              [
                'Tài khoản bị khóa',
                rows.filter((e) => e.TrangThaiTaiKhoan === 'LOCKED').length,
              ],
            ].map(([label, value]) => (
              <article key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
              </article>
            ))}
          </section>
          <section className="catalog-filters">
            <input
              aria-label="Tìm nhân viên"
              placeholder="Tên, mã nhân viên, email, điện thoại, chức vụ…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
            />
            <select
              aria-label="Vai trò"
              value={role}
              onChange={(e) => {
                setRole(e.target.value)
                setPage(1)
              }}
            >
              <option value="">Tất cả vai trò</option>
              <option value="ADMIN">Quản trị viên</option>
              <option value="STAFF">Nhân viên</option>
              <option value="CUSTOMER">Khách hàng (liên kết cũ)</option>
            </select>
            <select
              aria-label="Trạng thái hồ sơ"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value)
                setPage(1)
              }}
            >
              <option value="">Tất cả trạng thái hồ sơ</option>
              {['ACTIVE', 'INACTIVE', 'BLOCKED'].map((s) => (
                <option key={s} value={s}>
                  {employeeStatus(s)}
                </option>
              ))}
            </select>
            <button
              onClick={() => {
                setSearch('')
                setRole('')
                setStatus('')
                setPage(1)
              }}
            >
              Xóa bộ lọc
            </button>
          </section>
          <section className="catalog-table-card">
            <div className="catalog-table-scroll">
              <table className="catalog-table">
                <thead>
                  <tr>
                    <th>Nhân viên</th>
                    <th>Liên hệ / Đăng nhập</th>
                    <th>Chức vụ</th>
                    <th>Vai trò</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered
                    .slice((currentPage - 1) * 10, currentPage * 10)
                    .map((e) => (
                      <tr key={e.NhanVienID}>
                        <td>
                          <strong>{e.HoTen}</strong>
                          <small>
                            NV #{e.NhanVienID}
                            {Number(e.TaiKhoanID) === Number(self)
                              ? ' · Bạn'
                              : ''}
                          </small>
                          <small>Vào làm: {formatDate(e.NgayVaoLam)}</small>
                        </td>
                        <td>
                          {e.EmailDangNhap}
                          <small>{e.SoDienThoai || 'Chưa có điện thoại'}</small>
                        </td>
                        <td>{e.ChucVu || 'Chưa cập nhật'}</td>
                        <td>
                          <span
                            className={`catalog-badge ${e.VaiTro === 'ADMIN' ? 'admin' : ''}`}
                          >
                            {e.VaiTro === 'ADMIN'
                              ? 'Quản trị viên'
                              : e.VaiTro === 'STAFF'
                                ? 'Nhân viên'
                                : e.VaiTro}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`catalog-badge ${e.TrangThai.toLowerCase()}`}
                          >
                            {employeeStatus(e.TrangThai)}
                          </span>
                          <small>
                            Tài khoản: {employeeStatus(e.TrangThaiTaiKhoan)}
                          </small>
                        </td>
                        <td>
                          <div className="catalog-row-actions">
                            <button onClick={() => open('profile', e)}>
                              Hồ sơ / Sửa
                            </button>
                            <button onClick={() => open('access', e)}>
                              Phân quyền
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            {!filtered.length && (
              <p className="catalog-state">Không có nhân viên phù hợp.</p>
            )}
            <Pagination
              page={currentPage}
              total={filtered.length}
              size={10}
              onChange={setPage}
            />
          </section>
          <section className="employee-role-info">
            <h2>Vai trò và quyền truy cập</h2>
            <p>
              <strong>ADMIN:</strong> được đăng nhập trang quản trị và sử dụng
              API quản lý nhân viên có xác thực Admin.
            </p>
            <p>
              <strong>STAFF:</strong> vai trò nhân viên; luồng đăng nhập Website
              hiện chỉ cho phép ADMIN.
            </p>
            <p>
              Trạng thái hồ sơ và tài khoản được quản lý riêng. Để chặn đăng
              nhập, chọn “Đã khóa” trong Phân quyền. Hệ thống chưa hỗ trợ cấp
              quyền riêng theo từng chức năng.
            </p>
          </section>
        </>
      )}
      {editor && (
        <Modal
          title={
            editor.type === 'access'
              ? `Phân quyền: ${current?.HoTen}`
              : current
                ? 'Hồ sơ nhân viên'
                : 'Thêm nhân viên và tài khoản'
          }
          onClose={close}
        >
          <form className="catalog-form" onSubmit={save}>
            <fieldset disabled={busy}>
              {editor.type === 'access' ? (
                <>
                  <p className="catalog-full">
                    Tài khoản: <strong>{current?.EmailDangNhap}</strong>
                  </p>
                  <label>
                    Vai trò
                    <select
                      name="VaiTro"
                      defaultValue={
                        current?.VaiTro === 'ADMIN' ? 'ADMIN' : 'STAFF'
                      }
                    >
                      <option value="ADMIN">ADMIN — Quản trị viên</option>
                      <option value="STAFF" disabled={isSelf}>
                        STAFF — Nhân viên
                      </option>
                    </select>
                  </label>
                  <label>
                    Trạng thái tài khoản
                    <select
                      name="TrangThaiTaiKhoan"
                      defaultValue={current?.TrangThaiTaiKhoan}
                    >
                      <option value="ACTIVE">Hoạt động</option>
                      <option value="LOCKED" disabled={isSelf}>
                        Đã khóa
                      </option>
                    </select>
                  </label>
                  <p className="catalog-full">
                    {isSelf
                      ? 'Bạn không thể tự khóa hoặc hạ quyền tài khoản đang đăng nhập.'
                      : 'Lưu thay đổi sẽ áp dụng vai trò và trạng thái mới cho tài khoản này.'}
                  </p>
                </>
              ) : (
                <>
                  <label className="catalog-full">
                    Họ tên *
                    <input
                      autoFocus
                      name="HoTen"
                      required
                      maxLength={100}
                      defaultValue={current?.HoTen}
                    />
                  </label>
                  <label>
                    Điện thoại
                    <input
                      name="SoDienThoai"
                      maxLength={20}
                      defaultValue={current?.SoDienThoai || ''}
                    />
                  </label>
                  <label>
                    Email liên hệ
                    <input
                      name="Email"
                      type="email"
                      maxLength={100}
                      defaultValue={current?.Email || ''}
                    />
                  </label>
                  <label>
                    Ngày sinh
                    <input
                      name="NgaySinh"
                      type="date"
                      defaultValue={dateKey(current?.NgaySinh || '')}
                    />
                  </label>
                  <label>
                    Giới tính
                    <select
                      name="GioiTinh"
                      defaultValue={current?.GioiTinh || ''}
                    >
                      <option value="">Chưa cập nhật</option>
                      <option value="NAM">Nam</option>
                      <option value="NU">Nữ</option>
                      <option value="KHAC">Khác</option>
                    </select>
                  </label>
                  <label>
                    Chức vụ
                    <input
                      name="ChucVu"
                      maxLength={100}
                      defaultValue={current?.ChucVu || ''}
                    />
                  </label>
                  <label>
                    Ngày vào làm
                    <input
                      name="NgayVaoLam"
                      type="date"
                      defaultValue={dateKey(current?.NgayVaoLam || '')}
                    />
                  </label>
                  <label>
                    Trạng thái hồ sơ
                    <select
                      name="TrangThai"
                      defaultValue={current?.TrangThai || 'ACTIVE'}
                    >
                      <option value="ACTIVE">Hoạt động</option>
                      <option value="INACTIVE" disabled={isSelf}>
                        Ngừng hoạt động
                      </option>
                      <option value="BLOCKED" disabled={isSelf}>
                        Bị khóa
                      </option>
                    </select>
                  </label>
                  {!current && (
                    <>
                      <label>
                        Vai trò
                        <select name="VaiTro" defaultValue="STAFF">
                          <option value="STAFF">Nhân viên</option>
                          <option value="ADMIN">Quản trị viên</option>
                        </select>
                      </label>
                      <label>
                        Email đăng nhập *
                        <input
                          name="EmailDangNhap"
                          type="email"
                          required
                          maxLength={100}
                          autoComplete="off"
                        />
                      </label>
                      <label>
                        Mật khẩu ban đầu *
                        <input
                          name="MatKhau"
                          type="password"
                          required
                          minLength={8}
                          maxLength={255}
                          autoComplete="new-password"
                        />
                      </label>
                    </>
                  )}
                </>
              )}
            </fieldset>
            {saveError && (
              <p className="catalog-error" role="alert">
                {saveError}
              </p>
            )}
            <footer>
              <button type="button" disabled={busy} onClick={close}>
                Hủy
              </button>
              <button className="catalog-primary" disabled={busy}>
                {busy ? 'Đang lưu…' : 'Lưu thay đổi'}
              </button>
            </footer>
          </form>
        </Modal>
      )}
    </div>
  )
}
