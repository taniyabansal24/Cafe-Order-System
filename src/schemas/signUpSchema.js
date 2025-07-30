import { z } from 'zod';

export const passwordValidation = z
  .string()
  .min(8, { message: "Password must be at least 8 characters long" })
  .regex(/[A-Z]/, { message: "Must include at least one uppercase letter" })
  .regex(/[a-z]/, { message: "Must include at least one lowercase letter" })
  .regex(/[0-9]/, { message: "Must include at least one number" })
  .regex(/[^A-Za-z0-9]/, { message: "Must include at least one special character" });

export const signUpSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: passwordValidation,
  phone: z.preprocess(
  (val) => {
    if (typeof val === "string" && /^[6-9]\d{9}$/.test(val)) {
      return `+91${val}`;
    }
    return val;
  },
  z.string().regex(/^\+91[6-9]\d{9}$/, {
    message: "Please enter a valid Indian phone number",
  })
),
  city: z.string().min(1, { message: "City is required" }),
  state: z.string().min(1, { message: "State is required" }),
  pincode: z
    .string()
    .regex(/^[0-9]{6}$/, {
      message: "Pincode must be a valid 6-digit number",
    }),
  cafeName: z.string().min(1, { message: "Cafe name is required" }),
  address: z.string().min(1, { message: "Address is required" }),
});
