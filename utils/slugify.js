
export const slugify = (text) => {
  if (typeof text !== 'string' || text === null || text === undefined) {
    return "";
  }
  return text.toLowerCase()
    .replace(/\s+/g, "-") 
    .replace(/[^\w-]+/g, ""); 
};