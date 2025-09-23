import { z } from 'zod';

export const adminLoginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export const telegramValidateSchema = z.object({
  initData: z.string().min(1, 'Init data is required')
});

export type AdminLoginInput = z.infer<typeof adminLoginSchema>;
export type TelegramValidateInput = z.infer<typeof telegramValidateSchema>;

