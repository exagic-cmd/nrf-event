/**
 * Formats a price value. If the number is an integer, it returns it as a string.
 * If it has non-zero decimal places, it formats it to two decimal places.
 * @param {number | string} value The price to format.
 * @returns {string} The formatted price string.
 */
export const formatPrice = (value) => {
  const num = Number(value);
  if (isNaN(num)) return "0";
  return Number.isInteger(num) ? num.toString() : num.toFixed(2);
};

export const roundOff = (value) => {
  const num = Number(value);
  if (isNaN(num)) return "0";
  return Math.round(num).toString();
};