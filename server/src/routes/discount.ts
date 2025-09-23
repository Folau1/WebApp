import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/error';
import { validateDiscountSchema } from '../schemas/discount';

export const discountRouter = Router();

// Validate discount code
discountRouter.post('/validate', async (req, res, next) => {
  try {
    const data = validateDiscountSchema.parse(req.body);

    const discount = await prisma.discount.findUnique({
      where: { 
        code: data.code.toUpperCase(),
        active: true
      }
    });

    if (!discount) {
      throw new AppError(404, 'Invalid discount code');
    }

    // Check date validity
    const now = new Date();
    if (discount.startsAt && discount.startsAt > now) {
      throw new AppError(400, 'Discount code is not yet active');
    }

    if (discount.endsAt && discount.endsAt < now) {
      throw new AppError(400, 'Discount code has expired');
    }

    res.json({
      discount: {
        id: discount.id,
        code: discount.code,
        type: discount.type,
        value: discount.value
      }
    });
  } catch (error) {
    next(error);
  }
});

