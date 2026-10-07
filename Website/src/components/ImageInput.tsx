import { useEffect, useRef, useState } from 'react'
import { isImagePath, resolveBackendImageUrl, uploadImage } from '../services/images'

export default function ImageInput({ name, value = '', endpoint, onBusyChange }: {
  name: string
  value?: string | null
  endpoint: string
  onBusyChange: (busy: boolean) => void
}) {
  const [path, setPath] = useState(value || '')
  const [preview, setPreview] = useState<string>()
  const [error, setError] = useState('')
  const [failed, setFailed] = useState(false)
  const [busy, setBusy] = useState(false)
  const fileInput = useRef<HTMLInputElement>(null)
  const urlInput = useRef<HTMLInputElement>(null)
  const active = useRef(true)
  useEffect(() => {
    active.current = true
    return () => { active.current = false }
  }, [])
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview) }, [preview])
  async function choose(file?: File) {
    if (!file || busy) return
    setError('')
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) {
      setError('Chỉ chọn ảnh JPG, PNG hoặc WEBP tối đa 5 MB.')
      return
    }
    setPreview(URL.createObjectURL(file))
    setFailed(false)
    setBusy(true)
    onBusyChange(true)
    try {
      const uploaded = await uploadImage(endpoint, file)
      if (active.current) {
        setPath(uploaded)
        setFailed(false)
        urlInput.current?.setCustomValidity('')
      }
    } catch (failure) {
      if (active.current) setError(failure instanceof Error ? failure.message : 'Không thể tải ảnh lên.')
    } finally {
      if (active.current) {
        setPreview(undefined)
        setBusy(false)
        onBusyChange(false)
      }
    }
  }
  const source = preview || resolveBackendImageUrl(path)
  return (
    <div className="catalog-full">
      <label>
        URL / đường dẫn ảnh
        <input ref={urlInput} name={name} maxLength={255} value={path} disabled={busy}
          placeholder="https://… hoặc /uploads/…"
          onChange={event => {
            const next = event.target.value
            setPath(next)
            setFailed(false)
            setError('')
            event.target.setCustomValidity(next.trim() && !isImagePath(next.trim()) ? 'Nhập URL HTTP/HTTPS hoặc đường dẫn /uploads/ hợp lệ.' : '')
          }} />
      </label>
      <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" hidden
        onChange={event => { void choose(event.target.files?.[0]); event.target.value = '' }} />
      <button type="button" disabled={busy} onClick={() => fileInput.current?.click()}>Chọn ảnh từ máy</button>
      {busy && <p role="status">Đang tải ảnh…</p>}
      {source && !failed && <img key={source} src={source} alt="Xem trước ảnh" onError={() => setFailed(true)} style={{ display: 'block', width: 120, height: 120, objectFit: 'cover', marginTop: 8 }} />}
      {error && <p role="alert" className="catalog-error">{error}</p>}
    </div>
  )
}
