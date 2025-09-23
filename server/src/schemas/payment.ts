import { z } from 'zod';

export const createPaymentSchema = z.object({
  orderId: z.string().cuid()
});

export const yookassaWebhookSchema = z.object({
  type: z.string(),
  event: z.string(),
  object: z.object({
    id: z.string(),
    status: z.string(),
    paid: z.boolean(),
    amount: z.object({
      value: z.string(),
      currency: z.string()
    }),
    metadata: z.record(z.any()).optional()
  })
});

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
export type YookassaWebhookInput = z.infer<typeof yookassaWebhookSchema>;

