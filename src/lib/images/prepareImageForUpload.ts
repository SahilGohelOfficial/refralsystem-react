/** MIME types accepted by the payment API after client preparation. */
export const PAYMENT_API_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
] as const;

/** Accept attribute values for payment file inputs (includes iPhone HEIC). */
export const PAYMENT_IMAGE_ACCEPT = [
  ...PAYMENT_API_IMAGE_TYPES,
  'image/heic',
  'image/heif',
  '.heic',
  '.heif',
] as const;

export const MAX_PAYMENT_IMAGE_BYTES = 10 * 1024 * 1024;

export type PrepareImageOptions = {
  /** Target max file size after compression (MB). Default 1. */
  maxSizeMB?: number;
  /** Max width or height in pixels. Default 1920. */
  maxWidthOrHeight?: number;
  /** JPEG/WebP quality 0–1. Default 0.8. */
  initialQuality?: number;
};

const DEFAULT_OPTIONS: Required<PrepareImageOptions> = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  initialQuality: 0.8,
};

export function isHeicLike(file: File): boolean {
  const type = (file.type || '').toLowerCase();
  const name = file.name.toLowerCase();
  return (
    type === 'image/heic' ||
    type === 'image/heif' ||
    type.includes('heic') ||
    type.includes('heif') ||
    name.endsWith('.heic') ||
    name.endsWith('.heif')
  );
}

export function isImageFile(file: File): boolean {
  if (isHeicLike(file)) return true;
  return (file.type || '').startsWith('image/');
}

function replaceExtension(fileName: string, newExt: string): string {
  const base = fileName.replace(/\.[^/.]+$/, '') || 'image';
  return `${base}.${newExt}`;
}

function blobToFile(blob: Blob, fileName: string, type: string): File {
  return new File([blob], fileName, {
    type,
    lastModified: Date.now(),
  });
}

async function convertHeicToPng(file: File): Promise<File> {
  const { default: heic2any } = await import('heic2any');
  const result = await heic2any({
    blob: file,
    toType: 'image/png',
    quality: 1,
  });
  const blob = Array.isArray(result) ? result[0] : result;
  if (!blob) {
    throw new Error('HEIC_CONVERSION_EMPTY');
  }
  return blobToFile(blob, replaceExtension(file.name, 'png'), 'image/png');
}

async function compressImageFile(
  file: File,
  options: Required<PrepareImageOptions>,
  fileType?: string,
): Promise<File> {
  try {
    const { default: imageCompression } = await import('browser-image-compression');
    const compressed = await imageCompression(file, {
      maxSizeMB: options.maxSizeMB,
      maxWidthOrHeight: options.maxWidthOrHeight,
      initialQuality: options.initialQuality,
      // Avoid CDN worker fetch; main-thread compression is fine for screenshots.
      useWebWorker: false,
      fileType,
    });
    return compressed;
  } catch {
    return file;
  }
}

/**
 * Prepare a file for upload:
 * - Non-images: returned unchanged
 * - HEIC/HEIF (iPhone): converted to PNG, then resized/compressed
 * - Other images: resized/compressed (JPEG preferred for photos)
 */
export async function prepareImageForUpload(
  file: File,
  options?: PrepareImageOptions,
): Promise<File> {
  if (!isImageFile(file)) {
    return file;
  }

  const opts = { ...DEFAULT_OPTIONS, ...options };
  let working = file;
  let forcePng = false;

  if (isHeicLike(file)) {
    working = await convertHeicToPng(file);
    forcePng = true;
  }

  const outputType = forcePng
    ? 'image/png'
    : working.type === 'image/png' || working.type === 'image/gif'
      ? working.type
      : working.type === 'image/webp'
        ? 'image/webp'
        : 'image/jpeg';

  const compressed = await compressImageFile(
    working,
    opts,
    forcePng ? 'image/png' : outputType === 'image/jpeg' ? 'image/jpeg' : undefined,
  );

  // Ensure filename extension matches type after conversion/compression.
  let finalName = compressed.name || working.name;
  if (forcePng || compressed.type === 'image/png') {
    finalName = replaceExtension(finalName, 'png');
  } else if (compressed.type === 'image/jpeg' || compressed.type === 'image/jpg') {
    finalName = replaceExtension(finalName, 'jpg');
  } else if (compressed.type === 'image/webp') {
    finalName = replaceExtension(finalName, 'webp');
  }

  const type =
    compressed.type || (forcePng ? 'image/png' : 'image/jpeg');

  // Always return a real File so form validation (`instanceof File`) succeeds.
  if (compressed instanceof File && compressed.name === finalName && compressed.type === type) {
    return compressed;
  }

  return blobToFile(compressed, finalName, type);
}

export function isPaymentApiImageType(type: string): boolean {
  return (PAYMENT_API_IMAGE_TYPES as readonly string[]).includes(type);
}

/** HEIC tokens to append so iOS can pick originals when accept lists images. */
export function withHeicAccept(accept?: string[]): string[] | undefined {
  if (!accept?.length) return accept;
  const hasImage = accept.some(
    (t) =>
      t.startsWith('image/') ||
      t === 'image/*' ||
      ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.heic', '.heif'].includes(
        t.toLowerCase(),
      ),
  );
  if (!hasImage) return accept;

  const extra = ['image/heic', 'image/heif', '.heic', '.heif'];
  const set = new Set(accept);
  for (const token of extra) {
    if (![...set].some((a) => a.toLowerCase() === token)) {
      set.add(token);
    }
  }
  return [...set];
}
