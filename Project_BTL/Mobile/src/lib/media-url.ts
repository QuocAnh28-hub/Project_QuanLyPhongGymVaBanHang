import { baseUrl } from './account-api';

export function resolveMediaUrl(value: string | null | undefined): string | null {
  const image = value?.trim();
  if (!image) return null;
  if (/^https?:\/\//i.test(image)) return image;
  if (/^\/uploads\/[a-zA-Z0-9_/-]+\.(?:jpe?g|png|webp)$/i.test(image))
    return `${baseUrl}${image}`;
  return null;
}
