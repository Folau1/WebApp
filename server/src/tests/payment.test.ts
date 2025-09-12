import crypto from 'crypto';
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import { app } from '../index';
import { prisma } from '../lib/prisma';

describe('Payment Webhook', () => {
  let testOrder: any;
  let testUser: any;

  beforeAll(async () => {
    // Create test user
    testUser = await prisma.user.create({
      data: {
        tgId: 'test123',
        firstName: 'Test',
        lastName: 'User'
      }
    });

    // Create test order
    testOrder = await prisma.order.create({
      data: {
        userId: testUser.id,
        totalAmount: 100000,
        discountTotal: 0,
        status: 'PENDING',
        ykPaymentId: 'test-payment-123',
        items: {
          create: [
            {
              productId: 'test-product',
              title: 'Test Product',
              unitPrice: 100000,
              qty: 1,
              subtotal: 100000
            }
          ]
        }
      }
    });
  });

  afterAll(async () => {
    // Cleanup
    await prisma.order.deleteMany({ where: { userId: testUser.id } });
    await prisma.user.delete({ where: { id: testUser.id } });
    await prisma.$disconnect();
  });

  it('should update order status on successful payment', async () => {
    const webhookData = {
      type: 'notification',
      event: 'payment.succeeded',
      object: {
        id: 'test-payment-123',
        status: 'succeeded',
        paid: true,
        amount: {
          value: '1000.00',
          currency: 'RUB'
        },
        metadata: {
          orderId: testOrder.id,
          userId: testUser.id
        }
      }
    };

    // Create signature
    const body = JSON.stringify(webhookData);
    const signature = crypto
      .createHmac('sha256', process.env.YK_SECRET_KEY || 'test-secret')
      .update(body)
      .digest('hex');

    const response = await request(app)
      .post('/api/payments/yookassa/webhook')
      .set('X-Yookassa-Signature', signature)
      .send(webhookData);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });

    // Check order was updated
    const updatedOrder = await prisma.order.findUnique({
      where: { id: testOrder.id }
    });

    expect(updatedOrder?.status).toBe('PAID');
  });

  it('should reject webhook with invalid signature', async () => {
    const webhookData = {
      type: 'notification',
      event: 'payment.succeeded',
      object: {
        id: 'test-payment-123',
        status: 'succeeded',
        paid: true,
        amount: {
          value: '1000.00',
          currency: 'RUB'
        }
      }
    };

    const response = await request(app)
      .post('/api/payments/yookassa/webhook')
      .set('X-Yookassa-Signature', 'invalid-signature')
      .send(webhookData);

    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Invalid signature');
  });
});
