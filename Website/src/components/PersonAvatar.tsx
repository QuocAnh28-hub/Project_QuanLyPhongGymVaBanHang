import { useState } from 'react'
import { resolveBackendImageUrl } from '../services/images'
import './PersonAvatar.css'

export default function PersonAvatar({ name, image }: { name: string; image?: string | null }) {
  const source = resolveBackendImageUrl(image)
  const [failedSource, setFailedSource] = useState<string>()
  return (
    <i className="person-avatar" aria-hidden="true">
      {source && source !== failedSource
        ? <img src={source} alt="" loading="lazy" onError={() => setFailedSource(source)} />
        : name.trim().charAt(0) || '?'}
    </i>
  )
}
