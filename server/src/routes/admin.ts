import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/error';
import { verifyAdminToken } from '../middleware/auth';
import { 
  createProductSchema, 
  updateProductSchema,
  createCategorySchema,
  updateCategorySchema 
} from '../schemas/product';
import { createDiscountSchema, updateDiscountSchema } from '../schemas/discount';
import { orderQuerySchema } from '../schemas/order';
import { createMediaSchema } from '../schemas/media';
import { logger } from '../utils/logger';

export const adminRouter = Router();

// Apply admin auth to all routes
adminRouter.use(verifyAdminToken);

// Products CRUD
adminRouter.get('/products', async (req, res, next) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
        media: { orderBy: { order: 'asc' } },
        _count: { select: { orderItems: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ products });
  } catch (error) {
    next(error);
  }
});

adminRouter.post('/products', async (req, res, next) => {
  try {
    const data = createProductSchema.parse(req.body);

    const product = await prisma.product.create({
      data,
      include: {
        category: true,
        media: true
      }
    });

    logger.info({ productId: product.id }, 'Product created');
    res.json({ product });
  } catch (error) {
    next(error);
  }
});

adminRouter.put('/products/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = updateProductSchema.parse(req.body);

    const product = await prisma.product.update({
      where: { id },
      data,
      include: {
        category: true,
        media: { orderBy: { order: 'asc' } }
      }
    });

    logger.info({ productId: product.id }, 'Product updated');
    res.json({ product });
  } catch (error) {
    next(error);
  }
});

adminRouter.delete('/products/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.product.delete({
      where: { id }
    });

    logger.info({ productId: id }, 'Product deleted');
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// Categories CRUD
adminRouter.get('/categories', async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        parent: true,
        _count: { select: { products: true, children: true } }
      },
      orderBy: { name: 'asc' }
    });

    res.json({ categories });
  } catch (error) {
    next(error);
  }
});

adminRouter.post('/categories', async (req, res, next) => {
  try {
    const data = createCategorySchema.parse(req.body);

    const category = await prisma.category.create({
      data
    });

    logger.info({ categoryId: category.id }, 'Category created');
    res.json({ category });
  } catch (error) {
    next(error);
  }
});

adminRouter.put('/categories/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = updateCategorySchema.parse(req.body);

    const category = await prisma.category.update({
      where: { id },
      data
    });

    logger.info({ categoryId: category.id }, 'Category updated');
    res.json({ category });
  } catch (error) {
    next(error);
  }
});

adminRouter.delete('/categories/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if category has products
    const count = await prisma.product.count({
      where: { categoryId: id }
    });

    if (count > 0) {
      throw new AppError(400, 'Cannot delete category with products');
    }

    await prisma.category.delete({
      where: { id }
    });

    logger.info({ categoryId: id }, 'Category deleted');
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// Media management
adminRouter.post('/media', async (req, res, next) => {
  try {
    const data = createMediaSchema.parse(req.body);

    const media = await prisma.media.create({
      data
    });

    logger.info({ mediaId: media.id, productId: data.productId }, 'Media created');
    res.json({ media });
  } catch (error) {
    next(error);
  }
});

adminRouter.delete('/media/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.media.delete({
      where: { id }
    });

    logger.info({ mediaId: id }, 'Media deleted');
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

adminRouter.put('/media/reorder', async (req, res, next) => {
  try {
    const { mediaIds } = req.body;

    if (!Array.isArray(mediaIds)) {
      throw new AppError(400, 'mediaIds must be an array');
    }

    // Update order for each media
    await Promise.all(
      mediaIds.map((id, index) =>
        prisma.media.update({
          where: { id },
          data: { order: index }
        })
      )
    );

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// Discounts CRUD
adminRouter.get('/discounts', async (req, res, next) => {
  try {
    const discounts = await prisma.discount.findMany({
      include: {
        _count: {
          select: {
            products: true,
            categories: true,
            orders: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ discounts });
  } catch (error) {
    next(error);
  }
});

adminRouter.post('/discounts', async (req, res, next) => {
  try {
    const { productIds, categoryIds, ...data } = createDiscountSchema.parse(req.body);

    const discount = await prisma.discount.create({
      data: {
        ...data,
        products: productIds ? {
          create: productIds.map(productId => ({ productId }))
        } : undefined,
        categories: categoryIds ? {
          create: categoryIds.map(categoryId => ({ categoryId }))
        } : undefined
      },
      include: {
        products: { include: { product: true } },
        categories: { include: { category: true } }
      }
    });

    logger.info({ discountId: discount.id }, 'Discount created');
    res.json({ discount });
  } catch (error) {
    next(error);
  }
});

adminRouter.put('/discounts/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { productIds, categoryIds, ...data } = updateDiscountSchema.parse(req.body);

    // Update discount
    const discount = await prisma.discount.update({
      where: { id },
      data
    });

    // Update product associations if provided
    if (productIds !== undefined) {
      await prisma.discountOnProduct.deleteMany({
        where: { discountId: id }
      });

      if (productIds.length > 0) {
        await prisma.discountOnProduct.createMany({
          data: productIds.map(productId => ({
            discountId: id,
            productId
          }))
        });
      }
    }

    // Update category associations if provided
    if (categoryIds !== undefined) {
      await prisma.discountOnCategory.deleteMany({
        where: { discountId: id }
      });

      if (categoryIds.length > 0) {
        await prisma.discountOnCategory.createMany({
          data: categoryIds.map(categoryId => ({
            discountId: id,
            categoryId
          }))
        });
      }
    }

    logger.info({ discountId: discount.id }, 'Discount updated');
    res.json({ discount });
  } catch (error) {
    next(error);
  }
});

adminRouter.delete('/discounts/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.discount.delete({
      where: { id }
    });

    logger.info({ discountId: id }, 'Discount deleted');
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// Orders management
adminRouter.get('/orders', async (req, res, next) => {
  try {
    const query = orderQuerySchema.parse(req.query);
    const { page, limit, status, userId } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;
    if (userId) where.userId = userId;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: true,
          items: {
            include: {
              product: true
            }
          },
          discount: true
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.order.count({ where })
    ]);

    res.json({
      orders,
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

adminRouter.put('/orders/:id/status', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['PENDING', 'PAID', 'CANCELED', 'FULFILLED'].includes(status)) {
      throw new AppError(400, 'Invalid status');
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status }
    });

    logger.info({ orderId: order.id, status }, 'Order status updated');
    res.json({ order });
  } catch (error) {
    next(error);
  }
});

// Dashboard stats
adminRouter.get('/stats', async (req, res, next) => {
  try {
    const [
      totalProducts,
      totalOrders,
      totalRevenue,
      recentOrders
    ] = await Promise.all([
      prisma.product.count({ where: { active: true } }),
      prisma.order.count({ where: { status: 'PAID' } }),
      prisma.order.aggregate({
        where: { status: 'PAID' },
        _sum: { totalAmount: true }
      }),
      prisma.order.findMany({
        where: { status: 'PAID' },
        include: {
          user: true,
          _count: { select: { items: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      })
    ]);

    res.json({
      stats: {
        totalProducts,
        totalOrders,
        totalRevenue: totalRevenue._sum.totalAmount || 0,
        recentOrders
      }
    });
  } catch (error) {
    next(error);
  }
});
