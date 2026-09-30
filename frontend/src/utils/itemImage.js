// Single source of truth for resolving an item's display image.
// Backend normalizes every item with `imageUrl`, but this also accepts the
// legacy/alternate shapes (image, image_url, images[]) so cards never break.
// Returns a renderable URL (Cloudinary https or inline data URL), else null
// so callers show the existing "No Photo" placeholder.
export const getItemImageUrl = (item) => {
  if (!item) return null;
  const url =
    item.imageUrl ||
    item.image ||
    item.image_url ||
    (Array.isArray(item.images) ? item.images[0] : null);
  if (typeof url !== 'string' || url.length === 0) return null;
  if (url.startsWith('https://res.cloudinary.com/')) return url;
  if (url.startsWith('https://') || url.startsWith('data:image/')) return url;
  return null;
};
