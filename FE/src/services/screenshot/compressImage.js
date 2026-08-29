import { SCREENSHOT_DEFAULTS } from "./types.js";

function canvasToBlob(canvas, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Compression failed"))),
      "image/jpeg",
      quality,
    );
  });
}

async function resizeAndEncode(blob, scale, quality) {
  const bitmap = await createImageBitmap(blob);
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.floor(bitmap.width * scale));
  canvas.height = Math.max(1, Math.floor(bitmap.height * scale));
  canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvasToBlob(canvas, quality);
}

export async function compressToLimit(
  blob,
  { maxBytes = SCREENSHOT_DEFAULTS.maxBytes, jpegQuality = SCREENSHOT_DEFAULTS.jpegQuality } = {},
) {
  if (!blob || blob.size <= maxBytes) return blob;

  let quality = jpegQuality;
  let scale = 1.0;

  while (quality >= 0.3 || scale >= 0.5) {
    const compressed = await resizeAndEncode(blob, scale, quality);
    if (compressed.size <= maxBytes) return compressed;

    quality -= 0.1;
    if (quality < 0.3) {
      quality = jpegQuality;
      scale -= 0.1;
    }
  }

  return blob;
}
