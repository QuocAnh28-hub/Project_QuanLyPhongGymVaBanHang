export function DataState({ loading, error, retry }: { loading: boolean; error: string; retry: () => void }) {
  if (loading) return <div className="member-data-state" role="status">Đang tải dữ liệu hội viên…</div>
  if (error) return <div className="member-data-state" role="alert"><p>{error}</p><button onClick={retry}>Thử lại</button></div>
  return null
}
export function Pagination({ page, total, size, onChange }: { page: number; total: number; size: number; onChange: (page: number) => void }) {
  const pages = Math.max(1, Math.ceil(total / size))
  return <footer className="member-pagination"><span>{total ? (page - 1) * size + 1 : 0}–{Math.min(page * size, total)} / {total} kết quả</span><div><button disabled={page <= 1} onClick={() => onChange(page - 1)}>← Trước</button><span>Trang {page} / {pages}</span><button disabled={page >= pages} onClick={() => onChange(page + 1)}>Sau →</button></div></footer>
}
