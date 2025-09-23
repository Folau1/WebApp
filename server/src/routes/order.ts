import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/error';
import { verifyTelegramUser, AuthRequest } from '../middleware/auth';
import { createOrderSchema } from '../schemas/order';
import { calculateDiscountPrice, calculateOrderDiscount } from '../utils/discount';
import { logger } from '../utils/logger';

export const orderRouter = Router();

// Create order
orderRouter.post('/', async (req, res, next) => {
  try {
    const data = createOrderSchema.parse(req.body);
    const userId = null; // Для тестирования без Telegram

    // Validate products and calculate totals
    const products = await prisma.product.findMany({
      where: {
        id: { in: data.items.map(item => item.productId) },
        active: true
      },
      include: {
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

    if (products.length !== data.items.length) {
      throw new AppError(400, 'Some products not found or inactive');
    }

    // Calculate order items and subtotal
    const orderItems = data.items.map(item => {
      const product = products.find(p => p.id === item.productId)!;
      const { finalPrice } = calculateDiscountPrice(product);
      
      return {
        productId: product.id,
        title: product.title,
        unitPrice: finalPrice,
        qty: item.qty,
        subtotal: finalPrice * item.qty
      };
    });

    let subtotal = orderItems.reduce((sum, item) => sum + item.subtotal, 0);
    let discountTotal = 0;
    let discountId: string | null = null;

    // Apply discount code if provided
    if (data.discountCode) {
      const discount = await prisma.discount.findUnique({
        where: { 
          code: data.discountCode.toUpperCase(),
          active: true
        }
      });

      if (discount) {
        const now = new Date();
        if ((!discount.startsAt || discount.startsAt <= now) &&
            (!discount.endsAt || discount.endsAt >= now)) {
          discountTotal = calculateOrderDiscount(subtotal, discount);
          discountId = discount.id;
        }
      }
    }

    const totalAmount = Math.max(0, subtotal - discountTotal);

    // Generate order number
    const lastOrder = await prisma.order.findFirst({
      orderBy: { number: 'desc' }
    });
    const orderNumber = (lastOrder?.number || 0) + 1;

    // Create order
    const order = await prisma.order.create({
      data: {
        number: orderNumber,
        userId,
        totalAmount,
        discountTotal,
        discountId,
        address: data.address ? JSON.stringify(data.address) : null,
        items: {
          create: orderItems
        }
      },
      include: {
        items: true,
        discount: true
      }
    });

    logger.info({ orderId: order.id, userId }, 'Order created');

    res.json({ order });
  } catch (error) {
    next(error);
  }
});

// Get user orders
orderRouter.get('/my', async (req, res, next) => {
  try {
    // Для тестирования получаем все заказы
    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: {
            product: {
              include: {
                media: {
                  where: { kind: 'IMAGE' },
                  take: 1,
                  orderBy: { order: 'asc' }
                }
              }
            }
          }
        },
        discount: true
      },
      orderBy: { createdAt: 'desc' }
    });

    // Parse address JSON for each order
    const ordersWithParsedAddress = orders.map(order => ({
      ...order,
      address: order.address ? JSON.parse(order.address) : null
    }));

    res.json({ orders: ordersWithParsedAddress });
  } catch (error) {
    next(error);
  }
});

// Get single order
orderRouter.get('/:id', verifyTelegramUser, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const order = await prisma.order.findFirst({
      where: { 
        id,
        userId
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                media: {
                  take: 1,
                  orderBy: { order: 'asc' }
                }
              }
            }
          }
        },
        discount: true
      }
    });

    if (!order) {
      throw new AppError(404, 'Order not found');
    }

    res.json({ order });
  } catch (error) {
    next(error);
  }
});

