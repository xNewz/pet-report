import imageCompression from 'browser-image-compression';

/**
 * Utility: Compress and resize an image file on the client side before uploading.
 * Reduces storage consumption by up to 90-95% while keeping crystal clear quality.
 *
 * Mobile-optimized: now powered by browser-image-compression which perfectly
 * handles EXIF orientation, memory limits, and web workers.
 */
export interface CompressImageOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: "image/webp" | "image/jpeg" | "image/png";
}

export async function compressImage(
  file: File,
  options: CompressImageOptions = {}
): Promise<{ base64: string; originalSize: number; compressedSize: number }> {
  const {
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 0.78,
    format = "image/webp",
  } = options;

  const originalSize = file.size;
  
  // Use the larger dimension for maxWidthOrHeight
  const maxWidthOrHeight = Math.max(maxWidth, maxHeight);

  // browser-image-compression options
  const compressionOptions = {
    maxSizeMB: 1.5, // Conservative limit, we primarily want dimension reduction
    maxWidthOrHeight,
    useWebWorker: false, // Disabled: Web Workers often fail silently in iOS Chrome (WKWebView)
    fileType: format,
    initialQuality: quality,
    alwaysKeepResolution: false,
  };

  try {
    // 1. Compress the image
    const compressedBlob = await imageCompression(file, compressionOptions);
    const compressedSize = compressedBlob.size;

    // 2. Convert to Base64 (Data URL)
    const base64 = await imageCompression.getDataUrlFromFile(compressedBlob as File);

    return { base64, originalSize, compressedSize };
  } catch (error) {
    console.error("Error during image compression:", error);
    
    // Fallback: return original file as base64 if compression completely fails
    const fallbackBase64 = await imageCompression.getDataUrlFromFile(file);
    return {
      base64: fallbackBase64,
      originalSize,
      compressedSize: originalSize,
    };
  }
}

/**
 * Format bytes to readable string (e.g. 1.2 MB, 85 KB)
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}
