import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { generateUserCode } from "./clientApi";

// Tailwind class combiner
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// User ID handler (from localStorage or API)
export const getOrCreateUserId = async (): Promise<string | null> => {
  if (typeof window === "undefined") {
    // Server-side rendering: return null
    return null;
  }

  const params = new URLSearchParams(window.location.search);

  // Handle booking_token
  const bookingToken =
    params.get("booking_token") || localStorage.getItem("booking_token") || "";
  localStorage.setItem("booking_token", bookingToken);

  let userId = localStorage.getItem("userId");

  if (!userId) {
    try {
      const response = await generateUserCode();
      const userCode: string | undefined = response?.user_code;

      // Use API response if valid, else fallback
      userId = userCode?.trim()
        ? `USER_${userCode.trim()}`
        : `USER_${Math.random().toString(36).substr(2, 9)}`;
    } catch (error) {
      console.error("Failed to generate user code from API:", error);
      userId = `USER_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Only store if userId is valid
    if (userId) {
      localStorage.setItem("userId", userId);
    }
  }

  console.log("userID", userId);

  return userId;
};
