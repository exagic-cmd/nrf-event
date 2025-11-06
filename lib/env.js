// ✅ Capture env variables at build time (works in client + server)
export const ENV = {
  API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  IMAGE_BASE_URL: process.env.NEXT_PUBLIC_IMAGE_BASE_URL,
  GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
};

// ✅ Attach globally so no imports needed
// globalThis.$env = ENV;

export default ENV;
