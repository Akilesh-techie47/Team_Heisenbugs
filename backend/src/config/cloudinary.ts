import { v2 as cloudinary } from 'cloudinary';

// Cloudinary image storage for LostFound+ item photos.
// Credentials stay backend-only (CLOUDINARY_* in backend/.env) and are
// NEVER exposed to the React frontend. The frontend keeps sending the
// Base64 data URL it already produces; the backend uploads it once and
// stores only the returned secure_url in the item's `image` field.
//
// If credentials are missing, uploads are skipped with a warning and the
// original value is stored, so reporting keeps working offline/locally.
// NOTE: evaluated lazily (per upload, not at import time) because ES
// module imports execute before server.ts runs dotenv.config().
function readConfig() {
  const cloud_name = process.env.CLOUDINARY_CLOUD_NAME || '';
  const api_key = process.env.CLOUDINARY_API_KEY || '';
  const api_secret = process.env.CLOUDINARY_API_SECRET || '';
  return {
    configured: Boolean(cloud_name && api_key && api_secret),
    cloud_name,
    api_key,
    api_secret,
  };
}

export function isCloudinaryConfigured(): boolean {
  return readConfig().configured;
}

// Upload a Base64 data-URL image to Cloudinary and return its secure_url.
// Non-data-URL values (existing https URLs, bundled asset paths, empty)
// pass through untouched.
export async function uploadItemImage(image: unknown): Promise<unknown> {
  if (typeof image !== 'string' || !image.startsWith('data:image/')) {
    return image;
  }
  const cfg = readConfig();
  if (!cfg.configured) {
    console.warn(
      'Cloudinary not configured (CLOUDINARY_* missing); storing item image inline.'
    );
    return image;
  }
  cloudinary.config({
    cloud_name: cfg.cloud_name,
    api_key: cfg.api_key,
    api_secret: cfg.api_secret,
  });
  const result = await cloudinary.uploader.upload(image, {
    folder: 'lostfoundplus/items',
    resource_type: 'image',
    transformation: [{ width: 1200, height: 1200, crop: 'limit' }],
  });
  return result.secure_url;
}

export default cloudinary;
