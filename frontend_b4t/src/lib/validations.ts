import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().min(1, 'Username required'),
  password: z.string().min(1, 'Password required'),
});

export const registerSchema = z.object({
  name: z.string().min(1, 'Name required'),
  username: z.string().min(1, 'Username required'),
  email: z.string().email().optional(),
  password: z.string().min(6, 'Min 6 characters'),
});
