// utils/imageService.js
export const getFullImageUrl = (path) => {
  const baseUrl = `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}`;

  if (!path) return null;

  if (path.startsWith("http")) {
    return path;
  }

  // Remove leading slashes from the image path
  const cleanPath = path.replace(/^\/+/, "");

  return `${baseUrl}${cleanPath}`;
};