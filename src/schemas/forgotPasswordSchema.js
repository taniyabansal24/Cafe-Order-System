// schemas/forgotPasswordSchema.js
import * as z from "zod";

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const verifyPhoneSchema = z.object({
  code: z.string().length(6, "OTP must be 6 digits"),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});