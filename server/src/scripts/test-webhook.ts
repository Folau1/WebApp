import 'dotenv/config';
import crypto from 'crypto';
import axios from 'axios';

// Test webhook locally
async function testWebhook() {
  const webhookData = {
    type: 'notification',
    event: 'payment.succeeded',
    object: {
      id: 'test-payment-' + Date.now(),
      status: 'succeeded',
      paid: true,
      amount: {
        value: '1000.00',
        currency: 'RUB'
      },
      metadata: {
        orderId: process.argv[2] || 'test-order-id',
        userId: 'test-user-id'
      }
    }
  };

  const body = JSON.stringify(webhookData);
  const signature = crypto
    .createHmac('sha256', process.env.YK_SECRET_KEY!)
    .update(body)
    .digest('hex');

  try {
    const response = await axios.post(
      'http://localhost:3000/api/payments/yookassa/webhook',
      webhookData,
      {
        headers: {
          'X-Yookassa-Signature': signature,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Webhook test successful:', response.data);
  } catch (error: any) {
    console.error('❌ Webhook test failed:', error.response?.data || error.message);
  }
}

// Run if called directly
if (require.main === module) {
  testWebhook();
}








