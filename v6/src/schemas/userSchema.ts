import { z } from "zod";

// Define the Zod schema for user registration validation
export const userRegistrationSchema = z.object({
  firstname: z
    .string()
    .min(1, "First name is required")
    .max(20, "First name must be less than 20 characters"),
  lastname: z
    .string()
    .min(1, "Last name is required")
    .max(20, "Last name must be less than 20 characters"),
  email: z
    .string()
    .email("Invalid email address")
    .min(1, "Email is required")
    .max(45, "Email must be less than 45 characters"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long")
    .max(45, "Password must be less than 45 characters"),
  contact: z
    .string()
    .max(20, "Contact number must be less than 20 characters")
    .optional(),
});

export const loginSchema = z.object({
  email: z
    .string()
    .email("Invalid email address")
    .min(1, "Email is required")
    .max(45, "Email must be less than 45 characters"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long")
    .max(45, "Password must be less than 45 characters"),
});
