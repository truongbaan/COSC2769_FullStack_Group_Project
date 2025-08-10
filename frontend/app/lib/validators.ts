import { z } from "zod";

const usernameRegex = /^[A-Za-z0-9]{8,15}$/;
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,20}$/;

export const usernameSchema = z
  .string()
  .regex(usernameRegex, "Username must be 8-15 letters/digits");

export const passwordSchema = z
  .string()
  .regex(
    passwordRegex,
    "Password 8-20, includes upper, lower, digit, special !@#$%^&*"
  );

export const minLen5 = z.string().min(5, "Minimum length is 5");

export const productSchema = z.object({
  name: z.string().min(10).max(20),
  price: z.coerce.number().positive(),
  image: z.any().optional(),
  description: z.string().max(500),
});

export const priceFilterSchema = z
  .object({
    q: z.string().optional(),
    min: z.string().optional(),
    max: z.string().optional(),
  })
  .refine(
    (v) => {
      const min = Number(v.min);
      const max = Number(v.max);
      if (isNaN(min) && isNaN(max)) return true;
      if (!isNaN(min) && !isNaN(max)) return min <= max;
      return true;
    },
    { message: "Min must be <= Max" }
  );

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: passwordSchema,
});

export const customerRegistrationSchema = z.object({
  username: usernameSchema,
  password: passwordSchema,
  name: minLen5,
  address: minLen5,
  profilePic: z
    .any()
    .refine(
      (f) => f instanceof FileList && f.length > 0,
      "Profile picture required"
    ),
});

export const vendorRegistrationSchema = z.object({
  username: usernameSchema,
  password: passwordSchema,
  businessName: minLen5,
  businessAddress: minLen5,
  profilePic: z
    .any()
    .refine(
      (f) => f instanceof FileList && f.length > 0,
      "Profile picture required"
    ),
});

export const shipperRegistrationSchema = z.object({
  username: usernameSchema,
  password: passwordSchema,
  hub: z.string().min(1, "Select a hub"),
  profilePic: z
    .any()
    .refine(
      (f) => f instanceof FileList && f.length > 0,
      "Profile picture required"
    ),
});
