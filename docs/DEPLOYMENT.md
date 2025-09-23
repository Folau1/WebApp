# 🚀 Развертывание приложения

## Настройка CI/CD с GitHub Actions

### 1. Настройка GitHub Secrets

Перейдите в настройки репозитория: `Settings` → `Secrets and variables` → `Actions`

Добавьте следующие секреты:

| Secret Name | Value | Описание |
|-------------|-------|----------|
| `SERVER_HOST` | `109.248.11.230` | IP адрес сервера |
| `SERVER_USER` | `root` | Пользователь для SSH |
| `SERVER_PORT` | `22` | SSH порт |
| `SERVER_SSH_KEY` | `-----BEGIN OPENSSH PRIVATE KEY-----...` | Приватный SSH ключ |

### 2. Генерация SSH ключей

На вашем локальном компьютере:

```bash
# Генерируем SSH ключ
ssh-keygen -t rsa -b 4096 -C "github-actions@webapp"

# Копируем публичный ключ на сервер
ssh-copy-id root@109.248.11.230

# Показываем приватный ключ для добавления в GitHub Secrets
cat ~/.ssh/id_rsa
```

### 3. Первоначальная настройка сервера

Подключитесь к серверу и выполните:

```bash
# Скачиваем и запускаем скрипт настройки
curl -fsSL https://raw.githubusercontent.com/Folau1/WebApp/main/scripts/setup-server.sh | bash
```

Или вручную:

```bash
# Клонируем репозиторий
git clone https://github.com/Folau1/WebApp.git /root/WebApp
cd /root/WebApp

# Делаем скрипт исполняемым
chmod +x scripts/setup-server.sh

# Запускаем настройку
./scripts/setup-server.sh
```

### 4. Настройка переменных окружения

Отредактируйте файл `.env` на сервере:

```bash
nano /root/WebApp/.env
```

Пример конфигурации:

```env
# Database
DATABASE_URL="file:./dev.db"

# Server
PORT=3000
NODE_ENV=production

# Admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your_secure_password

# Telegram Bot (опционально)
BOT_TOKEN=your_bot_token
WEBAPP_URL=https://109.248.11.230
ADMIN_CHAT_ID=your_chat_id

# YooKassa (опционально)
YK_SHOP_ID=your_shop_id
YK_SECRET_KEY=your_secret_key
```

### 5. Запуск приложения

После настройки приложение будет доступно по адресам:

- **WebApp**: http://109.248.11.230
- **Admin Panel**: http://109.248.11.230/admin
- **API**: http://109.248.11.230/api

### 6. Управление приложением

```bash
# Статус приложения
pm2 status

# Логи приложения
pm2 logs webapp-server

# Перезапуск приложения
pm2 restart webapp-server

# Остановка приложения
pm2 stop webapp-server

# Статус Docker сервисов
docker-compose -f docker-compose.dev.yml ps

# Логи Docker сервисов
docker-compose -f docker-compose.dev.yml logs
```

### 7. Автоматическое развертывание

После настройки GitHub Actions, каждое изменение в ветке `main` будет автоматически развертываться на сервер:

1. Push в репозиторий
2. GitHub Actions запускает workflow
3. Код собирается и тестируется
4. Приложение развертывается на сервер
5. Проверяется работоспособность

### 8. Мониторинг

Для мониторинга состояния приложения:

```bash
# Системные ресурсы
htop

# Статус сервисов
systemctl status nginx
pm2 status
docker-compose -f docker-compose.dev.yml ps

# Логи
journalctl -u nginx -f
pm2 logs webapp-server -f
docker-compose -f docker-compose.dev.yml logs -f
```

### 9. Обновление приложения

Приложение обновляется автоматически при каждом push в `main`. Для ручного обновления:

```bash
cd /root/WebApp
git pull origin main
npm ci
npm run build
pm2 restart webapp-server
```

### 10. Резервное копирование

```bash
# Создание бэкапа базы данных
cp /root/WebApp/server/prisma/dev.db /root/backup/dev-$(date +%Y%m%d).db

# Создание бэкапа загруженных файлов
tar -czf /root/backup/uploads-$(date +%Y%m%d).tar.gz /root/WebApp/uploads/
```

## Troubleshooting

### Проблемы с SSH

```bash
# Проверка SSH подключения
ssh -v root@109.248.11.230

# Проверка SSH ключей
ssh-add -l
```

### Проблемы с Docker

```bash
# Перезапуск Docker
systemctl restart docker

# Очистка Docker
docker system prune -a
```

### Проблемы с Nginx

```bash
# Проверка конфигурации
nginx -t

# Перезапуск Nginx
systemctl restart nginx

# Логи Nginx
tail -f /var/log/nginx/error.log
```