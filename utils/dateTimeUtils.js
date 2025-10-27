// utils/dateTimeUtils.js

export const parseDate = (dateStr) => {
  if (!dateStr) return null;
  const parts = dateStr.split("-");
  if (parts.length !== 3) return null;
  return new Date(parts[0], parts[1] - 1, parts[2]);
};

export const parseTime = (timeStr) => {
  if (!timeStr) return null;
  const parts = timeStr.split(":");
  if (parts.length < 2) return null;
  const now = new Date();
  now.setHours(parseInt(parts[0], 10));
  now.setMinutes(parseInt(parts[1], 10));
  now.setSeconds(0);
  now.setMilliseconds(0);
  return now;
};

export const formatDate = (dateObj) => {
  if (!dateObj) return "";
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, "0");
  const d = String(dateObj.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export const formatTime = (dateObj) => {
  if (!dateObj) return "";
  const h = String(dateObj.getHours()).padStart(2, "0");
  const min = String(dateObj.getMinutes()).padStart(2, "0");
  return `${h}:${min}`;
};
