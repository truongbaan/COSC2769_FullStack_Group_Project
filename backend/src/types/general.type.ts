/* RMIT University Vietnam 
# Course: COSC2769 - Full Stack Development 
# Semester: 2025B 
# Assessment: Assignment 02 
# Author: Truong Ba An
# ID: s3999568 */

import { z } from "zod";

export type Pagination = {
  page: number;
  size: number;
};

export type UpdateServiceResult = {
  success: boolean;
  error?: string;
};

// schema for query get multiple users
export const getUsersRoleQuerySchema = z
  .object({
    page: z
      .string()
      .default("-1")
      .transform((val) => parseInt(val, 10)),
    size: z
      .string()
      .default("-1")
      .transform((val) => parseInt(val, 10)),
  })
  .strict();

export type GetUsersRoleQueryType = z.output<typeof getUsersRoleQuerySchema>;

const usernameRegex = /^[A-Za-z0-9]{8,15}$/;
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,20}$/;

// schema for username
export const usernameSchema = z
  .string()
  .regex(usernameRegex, "Username must be 8-15 letters/digits")
  .trim();
export const passwordSchema = z
  .string()
  .regex(
    passwordRegex,
    "Password 8-20, includes upper, lower, digit, special !@#$%^&*"
  )
  .trim();
export type UserRole = "vendor" | "shipper" | "customer";

// Fixed product categories used across the backend
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

export const CategorySchema = z.enum(
  PRODUCT_CATEGORIES as unknown as [
    (typeof PRODUCT_CATEGORIES)[number],
    ...(typeof PRODUCT_CATEGORIES)[number][]
  ]
);
export type Category = z.output<typeof CategorySchema>;
