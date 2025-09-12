import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/error';
import { optionalTelegramAuth } from '../middleware/auth';
import { productQuerySchema } from '../schemas/product';
import { calculateDiscountPrice } from '../utils/discount';

export const catalogRouter = Router();

// Get all categories
catalogRouter.get('/categories', async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    res.json({ categories });
  } catch (error) {
    next(error);
  }
});

// Get products with filters
catalogRouter.get('/products', optionalTelegramAuth, async (req, res, next) => {
  try {
    const query = productQuerySchema.parse(req.query);
    const { page, limit, search, category, sort } = query;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      active: true
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (category) {
      where.categoryId = category;
    }

    // Build order by
    let orderBy: any = {};
    switch (sort) {
      case 'price_asc':
        orderBy = { price: 'asc' };
        break;
      case 'price_desc':
        orderBy = { price: 'desc' };
        break;
      case 'created_asc':
        orderBy = { createdAt: 'asc' };
        break;
      case 'created_desc':
      default:
        orderBy = { createdAt: 'desc' };
    }

    // Get products
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          category: true,
          media: {
            orderBy: { order: 'asc' }
          },
          discounts: {
            where: {
              discount: {
                active: true,
                OR: [
                  { startsAt: null },
                  { startsAt: { lte: new Date() } }
                ],
                AND: [
                  { OR: [
                    { endsAt: null },
                    { endsAt: { gte: new Date() } }
                  ]}
                ]
              }
            },
            include: {
              discount: true
            }
          }
        }
      }),
      prisma.product.count({ where })
    ]);

    // Calculate discount prices
    const productsWithPrices = products.map(product => {
      const discountPrice = calculateDiscountPrice(product);
      return {
        ...product,
        finalPrice: discountPrice.finalPrice,
        discount: discountPrice.discount
      };
    });

    res.json({
      products: productsWithPrices,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get single product by slug
catalogRouter.get('/products/:slug', optionalTelegramAuth, async (req, res, next) => {
  try {
    const { slug } = req.params;

    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        media: {
          orderBy: { order: 'asc' }
        },
        discounts: {
          where: {
            discount: {
              active: true,
              OR: [
                { startsAt: null },
                { startsAt: { lte: new Date() } }
              ],
              AND: [
                { OR: [
                  { endsAt: null },
                  { endsAt: { gte: new Date() } }
                ]}
              ]
            }
          },
          include: {
            discount: true
          }
        }
      }
    });

    if (!product || !product.active) {
      throw new AppError(404, 'Product not found');
    }

    // Calculate discount price
    const discountPrice = calculateDiscountPrice(product);

    res.json({
      product: {
        ...product,
        finalPrice: discountPrice.finalPrice,
        discount: discountPrice.discount
      }
    });
  } catch (error) {
    next(error);
  }
});
