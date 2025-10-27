// utils/slugify.js
export function slugify(str) {
  return str.toLowerCase().replace(/ /g, "-");
}
export function deslugify(str) {
  return str.replace(/-/g, " ");
}