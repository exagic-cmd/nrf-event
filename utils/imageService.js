// utils/imageService.js
export const getFullImageUrl = (path) => {
    const baseUrl = `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}v1746530123`;
    if (!path) return null;
    if (path.startsWith("http")) {
        return path;
    }
    return `${baseUrl}/${path}`;
  };
  