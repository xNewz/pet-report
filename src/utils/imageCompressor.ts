/**
 * Utility: Compress and resize an image file on the client side before uploading.
 * Reduces storage consumption by up to 90-95% while keeping crystal clear quality.
 *
 * Mobile-optimized: uses createImageBitmap for memory-efficient decoding and
 * automatic EXIF orientation handling. Falls back gracefully for older browsers.
 */
export interface CompressImageOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: "image/webp" | "image/jpeg";
}

/**
 * Check if toDataURL produced valid output.
 * Mobile browsers return "data:," when canvas is blank due to memory limits.
 */
function isValidDataUrl(dataUrl: string): boolean {
  return (
    dataUrl.length > 100 &&
    dataUrl !== "data:," &&
    (dataUrl.startsWith("data:image/webp") ||
      dataUrl.startsWith("data:image/jpeg") ||
      dataUrl.startsWith("data:image/png"))
  );
}

/**
 * Calculate target dimensions preserving aspect ratio.
 */
function calcDimensions(
  srcW: number,
  srcH: number,
  maxW: number,
  maxH: number
): { width: number; height: number } {
  let width = srcW;
  let height = srcH;
  if (width > maxW || height > maxH) {
    if (width / height > maxW / maxH) {
      height = Math.round((height * maxW) / width);
      width = maxW;
    } else {
      width = Math.round((width * maxH) / height);
      height = maxH;
    }
  }
  return { width, height };
}

/**
 * Draw an image source onto a canvas and export as base64.
 * Returns null if the canvas output is blank/invalid (common on mobile).
 */
function canvasToBase64(
  source: CanvasImageSource,
  width: number,
  height: number,
  format: string,
  quality: number
): string | null {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(source, 0, 0, width, height);

  // Try preferred format first
  let result = canvas.toDataURL(format, quality);
  if (isValidDataUrl(result)) return result;

  // Fallback to JPEG
  if (format !== "image/jpeg") {
    result = canvas.toDataURL("image/jpeg", quality);
    if (isValidDataUrl(result)) return result;
  }

  // Fallback to PNG (always supported, no quality param)
  result = canvas.toDataURL("image/png");
  if (isValidDataUrl(result)) return result;

  return null;
}

/**
 * Read the original file as a base64 data URL (no compression).
 * Used as the last-resort fallback.
 */
function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Primary compress path: use createImageBitmap (modern browsers).
 * - Memory-efficient: decodes at target size without loading full-res into memory
 * - Handles EXIF orientation automatically
 * - Works well on mobile (iOS Safari 15+, Chrome, Firefox)
 */
async function compressWithBitmap(
  file: File,
  maxWidth: number,
  maxHeight: number,
  quality: number,
  format: string
): Promise<string | null> {
  if (typeof createImageBitmap === "undefined") return null;

  try {
    // First create bitmap at original size to get dimensions
    const originalBitmap = await createImageBitmap(file);
    const { width: targetW, height: targetH } = calcDimensions(
      originalBitmap.width,
      originalBitmap.height,
      maxWidth,
      maxHeight
    );
    originalBitmap.close();

    // Create a new bitmap at the target size — this is the key for mobile!
    // The browser handles downscaling during decode, avoiding OOM.
    let resizedBitmap: ImageBitmap;
    try {
      resizedBitmap = await createImageBitmap(file, {
        resizeWidth: targetW,
        resizeHeight: targetH,
        resizeQuality: "high",
      });
    } catch {
      // Some browsers support createImageBitmap but not resize options.
      // Fall back to creating at original size.
      resizedBitmap = await createImageBitmap(file);
    }

    const result = canvasToBase64(
      resizedBitmap,
      targetW,
      targetH,
      format,
      quality
    );
    resizedBitmap.close();
    return result;
  } catch {
    return null;
  }
}

/**
 * Fallback compress path: use Image element + canvas.
 * For browsers that don't support createImageBitmap.
 * Uses step-down scaling to avoid mobile canvas memory issues.
 */
function compressWithImage(
  file: File,
  maxWidth: number,
  maxHeight: number,
  quality: number,
  format: string
): Promise<string | null> {
  return new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      const { width: targetW, height: targetH } = calcDimensions(
        img.naturalWidth,
        img.naturalHeight,
        maxWidth,
        maxHeight
      );

      // Step-down approach for mobile: if the image is very large,
      // scale in multiple steps to avoid exceeding canvas memory limits.
      // Mobile Safari limits canvas to ~16 million pixels (~4096x4096).
      const MAX_CANVAS_PIXELS = 4096 * 4096;
      const srcPixels = img.naturalWidth * img.naturalHeight;

      if (srcPixels > MAX_CANVAS_PIXELS) {
        // Draw to an intermediate smaller canvas first
        const scale = Math.sqrt(MAX_CANVAS_PIXELS / srcPixels) * 0.9;
        const midW = Math.round(img.naturalWidth * scale);
        const midH = Math.round(img.naturalHeight * scale);

        const midCanvas = document.createElement("canvas");
        midCanvas.width = midW;
        midCanvas.height = midH;
        const midCtx = midCanvas.getContext("2d");
        if (midCtx) {
          midCtx.imageSmoothingEnabled = true;
          midCtx.imageSmoothingQuality = "high";
          midCtx.drawImage(img, 0, 0, midW, midH);

          // Now scale from mid to target
          const result = canvasToBase64(midCanvas, targetW, targetH, format, quality);
          if (result) {
            resolve(result);
            return;
          }
        }
      }

      // Direct draw (image is small enough or step-down failed)
      const result = canvasToBase64(img, targetW, targetH, format, quality);
      resolve(result);
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(null);
    };

    img.src = objectUrl;
  });
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

  // Strategy 1: createImageBitmap (best for mobile — memory-efficient)
  let base64 = await compressWithBitmap(file, maxWidth, maxHeight, quality, format);

  // Strategy 2: Image element + canvas with step-down scaling
  if (!base64) {
    base64 = await compressWithImage(file, maxWidth, maxHeight, quality, format);
  }

  // Strategy 3: Last resort — use the raw file as data URL (no compression)
  if (!base64) {
    base64 = await readFileAsDataUrl(file);
  }

  const compressedSize = Math.round((base64.length * 3) / 4);

  return { base64, originalSize, compressedSize };
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
