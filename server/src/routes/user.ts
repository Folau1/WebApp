import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { verifyTelegramUser, AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/error';

const userRouter = Router();

// Get current user profile
userRouter.get('/profile', verifyTelegramUser, async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) {
      throw new AppError(401, 'User not authenticated');
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        tgId: true,
        firstName: true,
        lastName: true,
        username: true,
        photoUrl: true,
        languageCode: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            orders: true
          }
        }
      }
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
});

// Update user profile
userRouter.patch('/profile', verifyTelegramUser, async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) {
      throw new AppError(401, 'User not authenticated');
    }

    const { firstName, lastName, username } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        firstName,
        lastName,
        username
      },
      select: {
        id: true,
        tgId: true,
        firstName: true,
        lastName: true,
        username: true,
        photoUrl: true,
        languageCode: true,
        role: true,
        createdAt: true
      }
    });

    res.json({ user });
  } catch (error) {
    next(error);
  }
});

// Get user orders
userRouter.get('/orders', verifyTelegramUser, async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) {
      throw new AppError(401, 'User not authenticated');
    }

    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
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

export { userRouter };
