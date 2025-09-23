import { z } from 'zod';

export const telegramUserSchema = z.object({
  id: z.number(),
  first_name: z.string(),
  last_name: z.string().optional(),
  username: z.string().optional(),
  photo_url: z.string().optional(),
  language_code: z.string().optional(),
});

export const telegramInitDataSchema = z.object({
  user: telegramUserSchema,
  auth_date: z.number(),
  hash: z.string(),
});

export const createUserFromTelegramSchema = z.object({
  tgId: z.string(),
  firstName: z.string(),
  lastName: z.string().optional(),
  username: z.string().optional(),
  photoUrl: z.string().optional(),
  languageCode: z.string().optional(),
});

export type TelegramUser = z.infer<typeof telegramUserSchema>;
export type TelegramInitData = z.infer<typeof telegramInitDataSchema>;
export type CreateUserFromTelegram = z.infer<typeof createUserFromTelegramSchema>;
