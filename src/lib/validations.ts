import { z } from "zod";

export const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    role: z.enum(["LANDLORD", "RENTER"]),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const flatSchema = z.object({
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  country: z.string().default("Germany"),
  description: z.string().optional(),
});

export const reviewSchema = z.object({
  flatId: z.string().cuid("Invalid flat ID"),
  ratings: z.object({
    overall: z.number().min(1).max(5),
    location: z.number().min(1).max(5).optional(),
    price: z.number().min(1).max(5).optional(),
    condition: z.number().min(1).max(5).optional(),
    noise: z.number().min(1).max(5).optional(),
    landlord: z.number().min(1).max(5).optional(),
  }),
  comment: z.string().min(10, "Review must be at least 10 characters"),
  isAnonymous: z.boolean().default(false),
});

export const landlordResponseSchema = z.object({
  response: z
    .string()
    .min(1, "Response is required")
    .max(1000, "Response too long"),
});

export const verifyFlatSchema = z.object({
  verificationCode: z.string().min(1, "Verification code is required"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type FlatInput = z.infer<typeof flatSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
export type LandlordResponseInput = z.infer<typeof landlordResponseSchema>;
export type VerifyFlatInput = z.infer<typeof verifyFlatSchema>;
