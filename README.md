# Telegram WebApp Shop

Полнофункциональный Telegram WebApp магазин с админ-панелью, интеграцией YooKassa для оплаты через СБП, и управлением товарами.

## 🚀 Возможности

- 📱 **Telegram WebApp** - Полноценный магазин внутри Telegram
- 💳 **Оплата через СБП** - Интеграция с YooKassa
- 🛍️ **Каталог товаров** - Категории, поиск, фильтры
- 🛒 **Корзина** - Добавление товаров, изменение количества
- 💸 **Скидки** - Промокоды, процентные и фиксированные скидки
- 📸 **Медиа** - Поддержка фото и видео для товаров
- 👨‍💼 **Админ-панель** - Управление товарами, заказами, скидками
- 🤖 **Telegram бот** - Уведомления о заказах, команды
- 🐳 **Docker** - Простой деплой и разработка

## 🛠️ Технологии

### Backend
- Node.js + Express + TypeScript
- PostgreSQL + Prisma ORM
- JWT авторизация
- YooKassa API
- S3-совместимое хранилище (MinIO)

### Frontend
- React + TypeScript + Vite
- Telegram WebApp SDK
- Zustand для state management
- TailwindCSS
- React Router

### DevOps
- Docker + Docker Compose
- Nginx reverse proxy
- GitHub Actions ready

## 📋 Требования

- Node.js 18+
- Docker и Docker Compose
- Telegram Bot Token
- YooKassa аккаунт (для production)

## 🚀 Быстрый старт

### 1. Клонирование репозитория

```bash
git clone https://github.com/yourusername/telegram-webapp-shop.git
cd telegram-webapp-shop
```

### 2. Настройка переменных окружения

Скопируйте файл примера и заполните значения:

```bash
cp env.example .env
```

Обязательные переменные:
- `BOT_TOKEN` - токен вашего Telegram бота
- `WEBAPP_URL` - URL вашего WebApp (для разработки: https://localhost:8080)
- `ADMIN_CHAT_ID` - ID чата для уведомлений администратора
- `YK_SHOP_ID` и `YK_SECRET_KEY` - данные YooKassa

### 3. Установка зависимостей

```bash
npm install
```

### 4. Запуск для разработки

#### Запуск БД и хранилища:
```bash
docker-compose -f docker-compose.dev.yml up -d
```

#### Миграции БД:
```bash
npm run prisma:migrate
npm run prisma:seed
```

#### Запуск всех сервисов:
```bash
npm run dev
```

Сервисы будут доступны по адресам:
- WebApp: http://localhost:5173
- Admin: http://localhost:5174
- API: http://localhost:3000
- MinIO Console: http://localhost:9001

### 5. Настройка Telegram бота

1. Создайте бота через [@BotFather](https://t.me/botfather)
2. Получите токен и добавьте в `.env`
3. Настройте WebApp:
   ```
   /setmenubutton - установите кнопку для открытия WebApp
   ```

## 🐳 Production деплой

### Использование Docker Compose

```bash
# Сборка и запуск всех сервисов
docker-compose up -d

# Просмотр логов
docker-compose logs -f

# Остановка
docker-compose down
```

### Деплой на VPS

1. Настройте домен и SSL сертификаты
2. Обновите `WEBAPP_URL` и другие URL в `.env`
3. Используйте production профиль:
   ```bash
   docker-compose --profile production up -d
   ```

### Деплой на облачные платформы

#### Render.com
- Создайте Web Service для backend
- Создайте Static Site для frontend
- Добавьте PostgreSQL и настройте переменные

#### Fly.io
- Используйте `fly.toml` конфигурацию
- Деплой через `fly deploy`

## 📚 Структура проекта

```
.
├── apps/
│   ├── web/          # React WebApp
│   ├── admin/        # React Admin Panel
│   └── bot/          # Telegram Bot
├── server/           # Backend API
│   ├── src/
│   │   ├── routes/   # API endpoints
│   │   ├── schemas/  # Zod schemas
│   │   └── utils/    # Helpers
│   └── prisma/       # Database schema
├── infra/            # Infrastructure configs
└── docker-compose.yml
```

## 🔧 Команды

### Разработка
```bash
npm run dev              # Запуск всех сервисов
npm run dev:server       # Только backend
npm run dev:web          # Только WebApp
npm run dev:admin        # Только админка
npm run dev:bot          # Только бот
```

### База данных
```bash
npm run prisma:generate  # Генерация Prisma Client
npm run prisma:migrate   # Применение миграций
npm run prisma:seed      # Заполнение тестовыми данными
npm run prisma:studio    # GUI для БД
```

### Сборка
```bash
npm run build            # Сборка всех сервисов
docker-compose build     # Docker сборка
```

## 💳 Настройка YooKassa

1. Получите Shop ID и Secret Key в личном кабинете YooKassa
2. Настройте URL для уведомлений: `https://yourdomain.com/api/payments/yookassa/webhook`
3. Включите метод оплаты СБП
4. Для тестирования используйте тестовые данные YooKassa

## 🔒 Безопасность

- Все sensitive данные хранятся в переменных окружения
- JWT токены для админ-авторизации
- Валидация Telegram InitData на сервере
- Rate limiting для API
- CORS настройки
- Helmet для security headers

## 📝 API Документация

### Основные эндпоинты

#### Авторизация
- `POST /api/auth/admin/login` - вход в админку
- `POST /api/auth/telegram/validate` - валидация Telegram пользователя

#### Каталог
- `GET /api/catalog/categories` - список категорий
- `GET /api/catalog/products` - список товаров
- `GET /api/catalog/products/:slug` - детали товара

#### Заказы
- `POST /api/orders` - создание заказа
- `GET /api/orders/my` - заказы пользователя
- `GET /api/orders/:id` - детали заказа

#### Платежи
- `POST /api/payments/yookassa/create` - создание платежа
- `POST /api/payments/yookassa/webhook` - вебхук от YooKassa

## 🤝 Вклад в проект

1. Fork репозитория
2. Создайте feature branch (`git checkout -b feature/amazing`)
3. Commit изменения (`git commit -m 'Add amazing feature'`)
4. Push в branch (`git push origin feature/amazing`)
5. Создайте Pull Request

## 📄 Лицензия

MIT

## 👨‍💻 Автор

Ваше имя - [@yourusername](https://github.com/yourusername)

---

⭐ Если проект был полезен, поставьте звезду на GitHub!






