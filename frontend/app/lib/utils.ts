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
