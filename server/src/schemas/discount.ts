import { z } from 'zod';

export const createDiscountSchema = z.object({
  code: z.string().min(3).max(50).toUpperCase().optional(),
  type: z.enum(['PERCENT', 'FIXED']),
  value: z.number().int().positive(),
  startsAt: z.coerce.date().optional(),
  endsAt: z.coerce.date().optional(),
  active: z.boolean().default(true),
  productIds: z.array(z.string().cuid()).optional(),
  categoryIds: z.array(z.string().cuid()).optional()
}).refine(data => {
  if (data.type === 'PERCENT' && data.value > 100) {
    return false;
  }
  return true;
}, {
  message: 'Percent discount cannot be more than 100%',
  path: ['value']
}).refine(data => {
  if (data.startsAt && data.endsAt && data.startsAt >= data.endsAt) {
    return false;
  }
  return true;
}, {
  message: 'End date must be after start date',
  path: ['endsAt']
});

export const updateDiscountSchema = z.object({
  code: z.string().min(3).max(50).toUpperCase().optional(),
  type: z.enum(['PERCENT', 'FIXED']).optional(),
  value: z.number().int().positive().optional(),
  startsAt: z.coerce.date().optional(),
  endsAt: z.coerce.date().optional(),
  active: z.boolean().optional(),
  productIds: z.array(z.string().cuid()).optional(),
  categoryIds: z.array(z.string().cuid()).optional()
}).refine(data => {
  if (data.type === 'PERCENT' && data.value && data.value > 100) {
    return false;
  }
  return true;
}, {
  message: 'Percent discount cannot be more than 100%',
  path: ['value']
}).refine(data => {
  if (data.startsAt && data.endsAt && data.startsAt >= data.endsAt) {
    return false;
  }
  return true;
}, {
  message: 'End date must be after start date',
  path: ['endsAt']
});

export const validateDiscountSchema = z.object({
  code: z.string().min(1, 'Discount code is required')
});

export type CreateDiscountInput = z.infer<typeof createDiscountSchema>;
export type UpdateDiscountInput = z.infer<typeof updateDiscountSchema>;
export type ValidateDiscountInput = z.infer<typeof validateDiscountSchema>;

