import { z } from 'zod';

export const presignUrlSchema = z.object({
  filename: z.string().min(1, 'Filename is required'),
  contentType: z.string().min(1, 'Content type is required'),
  kind: z.enum(['IMAGE', 'VIDEO'])
});

export const createMediaSchema = z.object({
  productId: z.string().cuid(),
  kind: z.enum(['IMAGE', 'VIDEO']),
  url: z.string().url(),
  order: z.number().int().min(0).default(0)
});

export const updateMediaOrderSchema = z.object({
  mediaIds: z.array(z.string().cuid()).min(1)
});

export type PresignUrlInput = z.infer<typeof presignUrlSchema>;
export type CreateMediaInput = z.infer<typeof createMediaSchema>;
export type UpdateMediaOrderInput = z.infer<typeof updateMediaOrderSchema>;

