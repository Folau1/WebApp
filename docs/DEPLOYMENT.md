# Деплой Telegram WebApp Shop

## 🚀 Варианты деплоя

### 1. VPS с Docker Compose

#### Требования
- VPS с минимум 2GB RAM
- Docker и Docker Compose установлены
- Домен настроен на IP сервера
- SSL сертификат (Let's Encrypt)

#### Шаги

1. **Клонируйте репозиторий на сервер:**
```bash
git clone https://github.com/yourusername/telegram-webapp-shop.git
cd telegram-webapp-shop
```

2. **Настройте переменные окружения:**
```bash
cp env.example .env
nano .env
```

3. **Обновите URLs в .env:**
```
WEBAPP_URL=https://shop.yourdomain.com
YK_RETURN_URL=https://shop.yourdomain.com/payment/success
YK_WEBHOOK_URL=https://api.yourdomain.com/api/payments/yookassa/webhook
S3_PUBLIC_URL=https://s3.yourdomain.com/tgshop
```

4. **Настройте SSL с Certbot:**
```bash
sudo apt install certbot
sudo certbot certonly --standalone -d shop.yourdomain.com -d api.yourdomain.com -d admin.yourdomain.com
```

5. **Обновите nginx конфигурацию для SSL**

6. **Запустите приложение:**
```bash
docker-compose --profile production up -d
```

### 2. Render.com

#### Backend API

1. Создайте новый Web Service
2. Подключите GitHub репозиторий
3. Настройки:
   - Build Command: `cd server && npm install && npm run build`
   - Start Command: `cd server && npm start`
   - Environment: Node
   - План: минимум Starter ($7/месяц)

4. Добавьте environment variables из .env

5. Добавьте PostgreSQL database

#### Frontend (WebApp и Admin)

1. Создайте Static Site для каждого
2. Build настройки:
   - Build Command: `cd apps/web && npm install && npm run build`
   - Publish Directory: `apps/web/dist`

### 3. Fly.io

1. **Установите Fly CLI:**
```bash
curl -L https://fly.io/install.sh | sh
```

2. **Создайте приложения:**
```bash
fly apps create tgshop-api
fly apps create tgshop-web
fly apps create tgshop-admin
fly apps create tgshop-bot
```

3. **Добавьте PostgreSQL:**
```bash
fly postgres create --name tgshop-db
fly postgres attach tgshop-db --app tgshop-api
```

4. **Деплой каждого сервиса:**
```bash
cd server && fly deploy --app tgshop-api
cd ../apps/web && fly deploy --app tgshop-web
cd ../admin && fly deploy --app tgshop-admin
cd ../bot && fly deploy --app tgshop-bot
```

### 4. Kubernetes

Смотрите [k8s манифесты](../k8s/) для деплоя в Kubernetes кластер.

## 🔐 Настройка HTTPS

### Nginx + Let's Encrypt

1. **Установите Certbot:**
```bash
sudo apt install certbot python3-certbot-nginx
```

2. **Получите сертификаты:**
```bash
sudo certbot --nginx -d shop.yourdomain.com -d admin.yourdomain.com
```

3. **Автообновление:**
```bash
sudo certbot renew --dry-run
```

### Cloudflare

1. Добавьте домен в Cloudflare
2. Включите "Full (strict)" SSL/TLS mode
3. Настройте origin сертификаты

## 📊 Мониторинг

### Логи

```bash
# Все сервисы
docker-compose logs -f

# Конкретный сервис
docker-compose logs -f server
```

### Метрики

Рекомендуем настроить:
- Prometheus + Grafana для метрик
- Sentry для отслеживания ошибок
- Uptime monitoring (UptimeRobot, Pingdom)

## 🔄 Обновление

1. **Бэкап БД:**
```bash
docker-compose exec postgres pg_dump -U postgres tgshop > backup.sql
```

2. **Обновите код:**
```bash
git pull origin main
```

3. **Пересоберите и запустите:**
```bash
docker-compose build
docker-compose up -d
```

4. **Примените миграции:**
```bash
docker-compose exec server npx prisma migrate deploy
```

## 🚨 Troubleshooting

### Проблемы с памятью

Добавьте swap:
```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

### Проблемы с портами

Проверьте занятые порты:
```bash
sudo netstat -tulpn | grep LISTEN
```

### Проблемы с SSL

Проверьте сертификаты:
```bash
sudo certbot certificates
```

### Проблемы с БД

Подключитесь к БД:
```bash
docker-compose exec postgres psql -U postgres -d tgshop
```

## 📝 Чеклист production

- [ ] Все sensitive данные в переменных окружения
- [ ] HTTPS настроен для всех доменов
- [ ] Бэкапы БД настроены
- [ ] Логирование настроено
- [ ] Мониторинг настроен
- [ ] Rate limiting включен
- [ ] CORS правильно настроен
- [ ] Файрвол настроен
- [ ] Автообновление сертификатов
- [ ] YooKassa webhook проверен






