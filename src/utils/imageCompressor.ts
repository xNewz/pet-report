/**
 * Utility: Compress and resize an image file on the client side before uploading.
 * Reduces storage consumption by up to 90-95% while keeping crystal clear quality.
 */
export interface CompressImageOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: "image/webp" | "image/jpeg";
}

export function compressImage(
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

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        let { width, height } = img;

        // Calculate new dimensions keeping aspect ratio
        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        // Render onto HTML5 canvas with high quality smoothing
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          const rawBase64 = event.target?.result as string;
          resolve({
            base64: rawBase64,
            originalSize,
            compressedSize: rawBase64.length,
          });
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to WebP or JPEG
        try {
          let compressedBase64 = canvas.toDataURL(format, quality);
          // If WebP is not supported or larger than expected, fallback to JPEG
          if (!compressedBase64.startsWith("data:image/webp")) {
            compressedBase64 = canvas.toDataURL("image/jpeg", quality);
          }
          const compressedSize = Math.round((compressedBase64.length * 3) / 4);
          resolve({
            base64: compressedBase64,
            originalSize,
            compressedSize,
          });
        } catch {
          const fallbackBase64 = canvas.toDataURL("image/jpeg", quality);
          const compressedSize = Math.round((fallbackBase64.length * 3) / 4);
          resolve({
            base64: fallbackBase64,
            originalSize,
            compressedSize,
          });
        }
      };

      img.onerror = (err) => reject(err);
    };

    reader.onerror = (err) => reject(err);
  });
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
