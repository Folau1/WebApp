import 'dotenv/config';
import { Telegraf, Context } from 'telegraf';
import { PrismaClient } from '@prisma/client';
import { message } from 'telegraf/filters';
import express from 'express';
import { createServer } from 'http';

const bot = new Telegraf(process.env.BOT_TOKEN!);
const prisma = new PrismaClient();
const app = express();
const server = createServer(app);
const PORT = process.env.BOT_PORT || 3001;

// Express middleware
app.use(express.json());

// WebApp button
const webAppButton = {
  text: 'Открыть магазин',
  web_app: {
    url: process.env.WEBAPP_URL!
  }
};

// Start command
bot.command('start', async (ctx) => {
  const userId = ctx.from.id.toString();
  const firstName = ctx.from.first_name;
  const lastName = ctx.from.last_name || null;
  const username = ctx.from.username || null;

  // Find or create user
  try {
    await prisma.user.upsert({
      where: { tgId: userId },
      update: {
        firstName,
        lastName,
        username
      },
      create: {
        tgId: userId,
        firstName,
        lastName,
        username
      }
    });
  } catch (error) {
    console.error('Failed to upsert user:', error);
  }

  await ctx.reply(
    `Привет, ${firstName}! 👋\n\n` +
    'Добро пожаловать в наш магазин! Здесь вы найдете:\n' +
    '• Стильные сумки\n' +
    '• Товары для дома\n' +
    '• Украшения\n\n' +
    'Нажмите кнопку ниже, чтобы начать покупки!',
    {
      reply_markup: {
        keyboard: [[webAppButton]],
        resize_keyboard: true
      }
    }
  );
});

// Help command
bot.command('help', async (ctx) => {
  await ctx.reply(
    'Команды бота:\n\n' +
    '/start - Начать работу с ботом\n' +
    '/help - Показать это сообщение\n' +
    '/orders - Посмотреть ваши заказы\n\n' +
    'Для покупок используйте кнопку "Открыть магазин"'
  );
});

// Orders command
bot.command('orders', async (ctx) => {
  const userId = ctx.from.id.toString();

  try {
    const user = await prisma.user.findUnique({
      where: { tgId: userId },
      include: {
        orders: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    });

    if (!user || user.orders.length === 0) {
      await ctx.reply('У вас пока нет заказов. Самое время что-то купить! 🛍️');
      return;
    }

    const ordersText = user.orders.map(order => {
      const status = {
        PENDING: '⏳ Ожидает оплаты',
        PAID: '✅ Оплачен',
        CANCELED: '❌ Отменен',
        FULFILLED: '📦 Выполнен'
      }[order.status];

      const amount = (order.totalAmount / 100).toFixed(0);
      const date = new Date(order.createdAt).toLocaleDateString('ru-RU');

      return `Заказ №${order.number}\n${status}\n💰 ${amount} ₽\n📅 ${date}`;
    }).join('\n\n');

    await ctx.reply(
      `Ваши последние заказы:\n\n${ordersText}\n\n` +
      'Для просмотра всех заказов откройте магазин.',
      {
        reply_markup: {
          keyboard: [[webAppButton]],
          resize_keyboard: true
        }
      }
    );
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    await ctx.reply('Произошла ошибка при получении заказов. Попробуйте позже.');
  }
});

// Handle any text message
bot.on(message('text'), async (ctx) => {
  await ctx.reply(
    'Я пока не понимаю обычные сообщения 😅\n\n' +
    'Используйте команды или кнопку "Открыть магазин" для покупок!',
    {
      reply_markup: {
        keyboard: [[webAppButton]],
        resize_keyboard: true
      }
    }
  );
});

// HTTP endpoint for order notifications
app.post('/notify-order', async (req, res) => {
  const secret = req.headers['x-bot-secret'];
  if (secret !== (process.env.BOT_SECRET || 'internal-secret')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { order } = req.body;
  if (!order) {
    return res.status(400).json({ error: 'Order data required' });
  }

  await notifyAdminAboutOrder(order);
  res.json({ success: true });
});

// Notification function
async function notifyAdminAboutOrder(order: any) {
  const adminChatId = process.env.ADMIN_CHAT_ID;
  if (!adminChatId) return;

  try {
    const user = order.user;
    const userName = user ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Гость';
    const userLink = user?.username ? `@${user.username}` : '';
    
    const amount = (order.totalAmount / 100).toFixed(0);
    const itemsCount = order.items.length;

    const message = 
      `🎉 Новый оплаченный заказ!\n\n` +
      `Заказ №${order.number}\n` +
      `👤 Клиент: ${userName} ${userLink}\n` +
      `💰 Сумма: ${amount} ₽\n` +
      `📦 Товаров: ${itemsCount}\n\n` +
      `Проверьте админ-панель для деталей.`;

    await bot.telegram.sendMessage(adminChatId, message);
  } catch (error) {
    console.error('Failed to notify admin:', error);
  }
}

// Error handling
bot.catch((err, ctx) => {
  console.error('Bot error:', err);
  ctx.reply('Произошла ошибка. Попробуйте позже.').catch(() => {});
});

// Graceful shutdown
process.once('SIGINT', () => {
  bot.stop('SIGINT');
  prisma.$disconnect();
});

process.once('SIGTERM', () => {
  bot.stop('SIGTERM');
  prisma.$disconnect();
});

// Launch bot and HTTP server
Promise.all([
  bot.launch(),
  new Promise<void>((resolve) => {
    server.listen(PORT, () => {
      console.log(`HTTP server listening on port ${PORT}`);
      resolve();
    });
  })
])
  .then(() => {
    console.log('Bot and HTTP server started successfully');
  })
  .catch((err) => {
    console.error('Failed to start:', err);
    process.exit(1);
  });
