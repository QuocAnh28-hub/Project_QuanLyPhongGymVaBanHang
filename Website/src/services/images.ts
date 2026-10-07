import { catalogRequest } from './catalog'

export function isImagePath(value: string) {
  return /^https?:\/\//i.test(value) || /^\/uploads\/(?:pt|members|products)\/[a-zA-Z0-9_-]+\.(?:jpe?g|png|webp)$/i.test(value)
}
export function resolveBackendImageUrl(value: string | null | undefined) {
  if (!value || !isImagePath(value)) return undefined
  if (/^https?:\/\//i.test(value)) return value
  const base = import.meta.env.VITE_API_BASE_URL || '/api'
  return new URL(value, new URL(base, window.location.origin)).href
}
export async function uploadImage(endpoint: string, file: File) {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024)
    throw new Error('Chỉ chọn ảnh JPG, PNG hoặc WEBP tối đa 5 MB.')
  const body = new FormData()
  body.append('image', file)
  const result = await catalogRequest<{ path: string }>(endpoint, { method: 'POST', body })
  if (!result.path || !isImagePath(result.path) || !result.path.startsWith('/uploads/'))
    throw new Error('Đường dẫn ảnh trả về không hợp lệ.')
  return result.path
}
