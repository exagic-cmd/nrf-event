export function formatPrice(value) {
  const num = Number(value);
  if (Number.isNaN(num)) return "0";
  // Show as integer (round to nearest)
  return String(Math.round(num));
}

export default formatPrice;
