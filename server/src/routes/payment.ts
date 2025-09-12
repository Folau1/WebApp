import { Router } from 'express';
import crypto from 'crypto';
import { YooCheckout, ICreatePayment } from 'yookassa';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/error';
import { verifyTelegramUser, AuthRequest } from '../middleware/auth';
import { createPaymentSchema, yookassaWebhookSchema } from '../schemas/payment';
import { logger } from '../utils/logger';

export const paymentRouter = Router();

// Initialize YooKassa
const yookassa = new YooCheckout({
  shopId: process.env.YK_SHOP_ID!,
  secretKey: process.env.YK_SECRET_KEY!
});

// Create payment
paymentRouter.post('/yookassa/create', verifyTelegramUser, async (req: AuthRequest, res, next) => {
  try {
    const data = createPaymentSchema.parse(req.body);
    const userId = req.user!.id;

    // Get order
    const order = await prisma.order.findFirst({
      where: {
        id: data.orderId,
        userId,
        status: 'PENDING'
      }
    });

    if (!order) {
      throw new AppError(404, 'Order not found or already paid');
    }

    // Create idempotence key
    const idempotenceKey = crypto.randomUUID();

    // Create payment
    const paymentData: ICreatePayment = {
      amount: {
        value: (order.totalAmount / 100).toFixed(2), // Convert from kopecks to rubles
        currency: 'RUB'
      },
      payment_method_data: {
        type: 'sbp' // System for Quick Payments (СБП)
      },
      confirmation: {
        type: 'redirect',
        return_url: `${process.env.YK_RETURN_URL}?orderId=${order.id}`
      },
      description: `Заказ №${order.number}`,
      metadata: {
        orderId: order.id,
        userId: userId
      },
      capture: true
    };

    const payment = await yookassa.createPayment(paymentData, idempotenceKey);

    // Update order with payment ID
    await prisma.order.update({
      where: { id: order.id },
      data: { ykPaymentId: payment.id }
    });

    logger.info({ 
      orderId: order.id, 
      paymentId: payment.id,
      amount: payment.amount.value 
    }, 'Payment created');

    res.json({
      paymentId: payment.id,
      confirmationUrl: payment.confirmation.confirmation_url
    });
  } catch (error) {
    logger.error({ error }, 'Payment creation failed');
    next(error);
  }
});

// YooKassa webhook
paymentRouter.post('/yookassa/webhook', async (req, res, next) => {
  try {
    // Verify webhook signature
    const signature = req.headers['x-yookassa-signature'] as string;
    if (!signature) {
      throw new AppError(401, 'No signature provided');
    }

    // Create signature from request body
    const body = JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac('sha256', process.env.YK_SECRET_KEY!)
      .update(body)
      .digest('hex');

    if (signature !== expectedSignature) {
      throw new AppError(401, 'Invalid signature');
    }

    // Parse webhook data
    const webhookData = yookassaWebhookSchema.parse(req.body);

    if (webhookData.event === 'payment.succeeded') {
      const payment = webhookData.object;
      const orderId = payment.metadata?.orderId;

      if (!orderId) {
        logger.warn({ paymentId: payment.id }, 'Payment webhook without orderId');
        return res.json({ status: 'ok' });
      }

      // Update order status
      const order = await prisma.order.update({
        where: { 
          id: orderId,
          ykPaymentId: payment.id
        },
        data: { 
          status: 'PAID',
          metadata: {
            paidAt: new Date().toISOString(),
            paymentAmount: payment.amount.value,
            paymentCurrency: payment.amount.currency
          }
        },
        include: {
          user: true,
          items: true
        }
      });

      logger.info({ 
        orderId: order.id, 
        paymentId: payment.id 
      }, 'Order paid successfully');

      // Send notification to admin via Telegram bot
      try {
        await fetch(`http://localhost:${process.env.BOT_PORT || 3001}/notify-order`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Bot-Secret': process.env.BOT_SECRET || 'internal-secret'
          },
          body: JSON.stringify({ order })
        });
      } catch (notifyError) {
        logger.error({ error: notifyError }, 'Failed to notify admin');
      }

    } else if (webhookData.event === 'payment.canceled') {
      const payment = webhookData.object;
      const orderId = payment.metadata?.orderId;

      if (orderId) {
        await prisma.order.update({
          where: { 
            id: orderId,
            ykPaymentId: payment.id
          },
          data: { 
            status: 'CANCELED',
            metadata: {
              canceledAt: new Date().toISOString()
            }
          }
        });

        logger.info({ 
          orderId, 
          paymentId: payment.id 
        }, 'Order canceled');
      }
    }

    res.json({ status: 'ok' });
  } catch (error) {
    logger.error({ error, body: req.body }, 'Webhook processing failed');
    next(error);
  }
});

// Check payment status
paymentRouter.get('/yookassa/status/:paymentId', verifyTelegramUser, async (req: AuthRequest, res, next) => {
  try {
    const { paymentId } = req.params;
    const userId = req.user!.id;

    // Check if user owns this payment
    const order = await prisma.order.findFirst({
      where: {
        ykPaymentId: paymentId,
        userId
      }
    });

    if (!order) {
      throw new AppError(404, 'Payment not found');
    }

    // Get payment status from YooKassa
    const payment = await yookassa.getPayment(paymentId);

    res.json({
      status: payment.status,
      paid: payment.paid,
      orderId: order.id,
      orderStatus: order.status
    });
  } catch (error) {
    next(error);
  }
});
