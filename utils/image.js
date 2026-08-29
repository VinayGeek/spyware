const fs = require("fs/promises");
const path = require("path");

const IMAGE_SIGNATURES = [
  { bytes: [0xff, 0xd8, 0xff], contentType: "image/jpeg" },
  {
    bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
    contentType: "image/png",
  },
  { bytes: [0x47, 0x49, 0x46, 0x38], contentType: "image/gif" },
  {
    bytes: [0x52, 0x49, 0x46, 0x46],
    contentType: "image/webp",
    matches: (buffer) =>
      buffer.length >= 12 && buffer.subarray(8, 12).toString() === "WEBP",
  },
];

const IMAGE_EXTENSIONS = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "image/webp": "webp",
};

function decodeBase64Image(value) {
  const base64 = value.replace(/^data:image\/[a-zA-Z0-9.+-]+;base64,/, "");

  // Base64 can be sent with or without its trailing "=" padding.
  if (
    !base64 ||
    !/^[A-Za-z0-9+/]+={0,2}$/.test(base64) ||
    base64.length % 4 === 1
  ) {
    return null;
  }

  return Buffer.from(
    base64.padEnd(Math.ceil(base64.length / 4) * 4, "="),
    "base64"
  );
}

function toImageBuffer(image) {
  if (Buffer.isBuffer(image)) return image;

  if (Array.isArray(image)) {
    if (
      !image.every(
        (byte) => Number.isInteger(byte) && byte >= 0 && byte <= 255
      )
    ) {
      return null;
    }
    return Buffer.from(image);
  }

  // Supports both { type: "Buffer", data: [...] } and the frontend's
  // { type: "Buffer", data: "<base64>" } payload format.
  if (image && image.type === "Buffer") {
    if (Array.isArray(image.data)) return toImageBuffer(image.data);
    if (typeof image.data === "string") return decodeBase64Image(image.data);
    return null;
  }

  if (typeof image === "string") return decodeBase64Image(image);

  return null;
}

function getImageContentType(buffer) {
  const signature = IMAGE_SIGNATURES.find(
    ({ bytes, matches }) =>
      buffer
        .subarray(0, bytes.length)
        .every((byte, index) => byte === bytes[index]) &&
      (!matches || matches(buffer))
  );

  return signature?.contentType;
}

/**
 * Converts a Base64 value or Buffer into an image file in /uploads.
 * Use a unique filename (for example, the MongoDB image _id) to avoid
 * overwriting another image.
 */
async function saveImageToUploads(imageValue, filename) {
  const imageBuffer = toImageBuffer(imageValue);
  const contentType = imageBuffer && getImageContentType(imageBuffer);

  if (!imageBuffer?.length || !contentType) {
    throw new Error("Cannot save an invalid or unsupported image value.");
  }

  const safeFilename = String(filename).replace(/[^a-zA-Z0-9_-]/g, "");
  if (!safeFilename) {
    throw new Error("A valid filename is required to save the image.");
  }

  const uploadDirectory = path.join(__dirname, "..", "uploads");
  const filePath = path.join(
    uploadDirectory,
    `${safeFilename}.${IMAGE_EXTENSIONS[contentType]}`
  );

  await fs.mkdir(uploadDirectory, { recursive: true });
  await fs.writeFile(filePath, imageBuffer);

  return filePath;
}

module.exports = { toImageBuffer, getImageContentType, saveImageToUploads };
