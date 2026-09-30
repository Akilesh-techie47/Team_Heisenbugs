import path from 'path';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import { connectDB } from './src/config/db';
import { Item } from './src/models/Item';

dotenv.config({ path: path.resolve(process.cwd(), 'backend/.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config();

// =====================================================================
// Attach photos to seeded items that currently have no image.
//
// Uploads the bundled item photos to Cloudinary (folder lostfoundplus/seed)
// ONCE, then assigns the URLs to items whose titles actually match the
// photo (keyword-based, so a wallet never gets a backpack photo).
// Only items with a missing/empty `image` are touched (idempotent).
//
//   npm run seed:images
//
// Requires CLOUDINARY_* in backend/.env. New user reports get their own
// uploaded photos automatically via POST /api/items - this script only
// backfills the seed data.
// =====================================================================

const PHOTO_MAP: Array<{ file: string; match: RegExp; label: string }> = [
  { file: 'item_backpack_1790675619336.jpg', match: /backpack/i, label: 'backpacks' },
  { file: 'item_earbuds_1790675632652.jpg', match: /airdope|earbud/i, label: 'earbuds' },
  { file: 'item_wallet_1790675646048.jpg', match: /wallet/i, label: 'wallets' },
  { file: 'item_keys_1790675671885.jpg', match: /key/i, label: 'keys' },
];

async function main() {
  const cloud_name = process.env.CLOUDINARY_CLOUD_NAME || '';
  const api_key = process.env.CLOUDINARY_API_KEY || '';
  const api_secret = process.env.CLOUDINARY_API_SECRET || '';
  if (!cloud_name || !api_key || !api_secret) {
    console.error('CLOUDINARY_* missing in backend/.env - cannot upload seed photos.');
    process.exit(1);
  }
  cloudinary.config({ cloud_name, api_key, api_secret });

  await connectDB();

  for (const photo of PHOTO_MAP) {
    const localPath = path.resolve(
      process.cwd(),
      process.cwd().endsWith('backend') ? '../frontend' : 'frontend',
      'src/assets/images',
      photo.file
    );
    const uploaded = await cloudinary.uploader.upload(localPath, {
      folder: 'lostfoundplus/seed',
      resource_type: 'image',
      transformation: [{ width: 1200, height: 1200, crop: 'limit' }],
    });

    const res = await Item.updateMany(
      {
        title: { $regex: photo.match },
        $or: [{ image: { $exists: false } }, { image: null }, { image: '' }],
      },
      { $set: { image: uploaded.secure_url } }
    );
    console.log(`${photo.label}: ${uploaded.secure_url} -> ${res.modifiedCount} item(s) updated`);
  }

  const withImages = await Item.countDocuments({
    image: { $regex: /^https?:\/\// },
  });
  console.log(`Items with URL photos: ${withImages}`);
  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error('seed-images failed:', err);
  try {
    await mongoose.disconnect();
  } catch { }
  process.exit(1);
});
