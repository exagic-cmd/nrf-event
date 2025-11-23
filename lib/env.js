// ✅ Capture env variables at build time (works in client + server)
export const ENV = {
  API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  IMAGE_BASE_URL: process.env.NEXT_PUBLIC_IMAGE_BASE_URL,
  GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  CLOUDINARY_BASE_URL: process.env.NEXT_PUBLIC_CLOUDINARY_BASE_URL,
  AI_BASE_URL: process.env.NEXT_PUBLIC_AI_BASE_URL,
  GEVME_NAME: process.env.NEXT_PUBLIC_GEVME_NAME,
  GEVME_CLIENT_ID: process.env.NEXT_PUBLIC_GEVME_CLIENT_ID,
  GEVME_CLIENT_SECRET: process.env.NEXT_PUBLIC_GEVME_CLIENT_SECRET,
  GEVME_REDIRECT_URI: process.env.NEXT_PUBLIC_GEVME_REDIRECT_URI,
  GEVME_API_HOST: process.env.NEXT_PUBLIC_GEVME_API_HOST,
  
};

// ✅ Attach globally so no imports needed
// globalThis.$env = ENV;

export default ENV;
