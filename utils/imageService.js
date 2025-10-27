// utils/imageService.js
export const getFullImageUrl = (path) => {
    const baseUrl = "https://res.cloudinary.com/www-travelpakistani-com/image/upload/v1746530123";
    if (!path) return null;
    if (path.startsWith("http")) {
        return path;
    }
    return `${baseUrl}/${path}`;
  };
  