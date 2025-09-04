/* RMIT University Vietnam 
# Course: COSC2769 - Full Stack Development 
# Semester: 2025B 
# Assessment: Assignment 02 
# Author: Tran Hoang Linh
# ID: s4043097 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Backend URL for image serving
const BACKEND_URL = "http://localhost:5000";

/**
 * Converts a relative image path from the backend to a full URL
 * @param imagePath - The image path from the backend (can be relative or absolute URL)
 * @returns Full URL to the image or undefined if no valid path
 */
export function getBackendImageUrl(
  imagePath: string | null | undefined
): string | undefined {
  if (!imagePath || imagePath.trim() === "") {
    return undefined;
  }

  // If it's already a full URL, return as is
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }

  // If it's a relative path, prepend the backend URL
  return `${BACKEND_URL}${imagePath.startsWith("/") ? "" : "/"}${imagePath}`;
}

// Fixed product categories used across the frontend
export const PRODUCT_CATEGORIES = [
  "Electronics",
  "Fashion",
  "Beauty & Personal Care",
  "Home & Living",
  "Groceries & Essentials",
  "Sports & Outdoors",
  "Toys, Kids & Baby",
  "Automotive",
  "Books, Media & Entertainment",
  "Health & Wellness",
  "Office & Stationery",
  "Luxury & Premium",
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

/**
 * Extracts specific error message from API error response
 * @param error - The error object from API call
 * @param fallbackMessage - Default message to show if specific error can't be extracted
 * @returns The specific error message or fallback message
 */
export function getApiErrorMessage(
  error: any,
  fallbackMessage: string
): string {
  try {
    if (error instanceof Error) {
      const errorText = error.message;
      // Check if it's an API error with JSON response (format: "API 400: {...}")
      if (errorText.includes("API") && errorText.includes("{")) {
        try {
          const jsonStart = errorText.indexOf("{");
          const jsonPart = errorText.substring(jsonStart);
          const parsed = JSON.parse(jsonPart);
          if (parsed.message) {
            return parsed.message;
          }
        } catch (parseError) {
          // If JSON parsing fails, continue to fallback
          console.error("Error parsing API error:", parseError);
        }
      }
    }
    return fallbackMessage;
  } catch {
    return fallbackMessage;
  }
}
