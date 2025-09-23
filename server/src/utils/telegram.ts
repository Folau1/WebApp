import crypto from 'crypto';
import { TelegramUser, TelegramInitData } from '../schemas/telegram';

const BOT_TOKEN = process.env.BOT_TOKEN || '7650352879:AAF752cmQUgnv30F6yCDR_zf6KiFPHLJMR0';

/**
 * Валидация данных Telegram WebApp
 */
export function validateTelegramWebAppData(initData: string): TelegramInitData | null {
  try {
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    
    if (!hash) {
      return null;
    }

    // Удаляем hash из параметров для проверки
    urlParams.delete('hash');
    
    // Сортируем параметры
    const dataCheckString = Array.from(urlParams.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    // Создаем секретный ключ
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(BOT_TOKEN)
      .digest();

    // Вычисляем хеш
    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    // Проверяем хеш
    if (calculatedHash !== hash) {
      return null;
    }

    // Парсим данные пользователя
    const userStr = urlParams.get('user');
    if (!userStr) {
      return null;
    }

    const user = JSON.parse(userStr);
    const authDate = parseInt(urlParams.get('auth_date') || '0');

    // Проверяем время (данные не старше 24 часов)
    const now = Math.floor(Date.now() / 1000);
    if (now - authDate > 86400) {
      return null;
    }

    return {
      user,
      auth_date: authDate,
      hash,
    };
  } catch (error) {
    console.error('Error validating Telegram data:', error);
    return null;
  }
}

/**
 * Извлечение данных пользователя из Telegram WebApp
 */
export function extractTelegramUser(initData: string): TelegramUser | null {
  const validatedData = validateTelegramWebAppData(initData);
  return validatedData ? validatedData.user : null;
}

/**
 * Создание или обновление пользователя из данных Telegram
 */
export function createUserDataFromTelegram(user: TelegramUser) {
  return {
    tgId: user.id.toString(),
    firstName: user.first_name,
    lastName: user.last_name,
    username: user.username,
    photoUrl: user.photo_url,
    languageCode: user.language_code,
  };
}
