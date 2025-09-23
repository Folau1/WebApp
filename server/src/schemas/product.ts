import { z } from 'zod';

const baseProductSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens'),
  description: z.string().optional(),
  price: z.number().int().positive('Price must be positive'),
  compareAt: z.number().int().positive().optional(),
  stock: z.number().int().min(0, 'Stock must be non-negative').default(0),
  categoryId: z.string().cuid(),
  active: z.boolean().default(true)
});

export const createProductSchema = baseProductSchema.refine((data) => {
  // Если есть старая цена, она должна быть больше текущей
  if (data.compareAt && data.compareAt <= data.price) {
    return false;
  }
  return true;
}, {
  message: "Old price must be greater than current price",
  path: ["compareAt"]
});

export const updateProductSchema = baseProductSchema.partial().refine((data) => {
  // Если есть старая цена, она должна быть больше текущей
  if (data.compareAt && data.price && data.compareAt <= data.price) {
    return false;
  }
  return true;
}, {
  message: "Old price must be greater than current price",
  path: ["compareAt"]
});

export const productQuerySchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sort: z.enum(['price_asc', 'price_desc', 'created_desc', 'created_asc']).default('created_desc')
});

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens'),
  parentId: z.string().cuid().optional()
});

export const updateCategorySchema = createCategorySchema.partial();

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductQueryInput = z.infer<typeof productQuerySchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;

