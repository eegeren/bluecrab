import { z } from "zod";

const usernameRegex = /^[a-zA-Z0-9_]+$/;

export const registerSchema = z.object({
  username: z
    .string()
    .min(3)
    .max(32)
    .regex(usernameRegex, "Username can only contain letters, numbers, and underscores"),
  email: z.string().email().max(320),
  password: z
    .string()
    .min(8)
    .max(72)
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

export const loginSchema = z.object({
  email: z.string().email().max(320),
  password: z.string().min(8).max(72),
});

export const createPostSchema = z.object({
  content: z.string().min(1).max(5000),
});

export const postsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  authorId: z.string().uuid().optional(),
});
