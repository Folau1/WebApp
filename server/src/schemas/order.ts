import { z } from 'zod';

export const orderItemSchema = z.object({
  productId: z.string().cuid(),
  qty: z.number().int().positive('Quantity must be positive')
});

export const createOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1, 'Order must have at least one item'),
  discountCode: z.string().optional()
});

export const orderQuerySchema = z.object({
  status: z.enum(['PENDING', 'PAID', 'CANCELED', 'FULFILLED']).optional(),
  userId: z.string().cuid().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20)
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type OrderQueryInput = z.infer<typeof orderQuerySchema>;
