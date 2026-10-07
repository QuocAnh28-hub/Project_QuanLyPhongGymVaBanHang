import { Image, type ImageProps } from 'expo-image';
import { useState } from 'react';
import { resolveMediaUrl } from '@/lib/media-url';

export default function BackendImage({ value, fallback, ...props }: Omit<ImageProps, 'source' | 'onError'> & {
  value: string | null | undefined;
  fallback: ImageProps['source'];
}) {
  const uri = resolveMediaUrl(value);
  const [failedUri, setFailedUri] = useState<string | null>(null);
  return (
    <Image
      {...props}
      key={uri}
      source={uri && uri !== failedUri ? { uri } : fallback}
      onError={() => setFailedUri(uri)}
    />
  );
}
