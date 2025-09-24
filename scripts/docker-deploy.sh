#!/bin/bash

echo "🐳 Развертывание WebApp через Docker..."

# Переходим в директорию проекта
cd /root/WebApp

# Останавливаем все контейнеры
echo "🛑 Останавливаем старые контейнеры..."
docker-compose -f docker-compose.prod.yml down

# Удаляем старые образы
echo "🗑️ Удаляем старые образы..."
docker system prune -f

# Собираем новые образы
echo "🔨 Собираем новые образы..."
docker-compose -f docker-compose.prod.yml build --no-cache

# Запускаем контейнеры
echo "🚀 Запускаем контейнеры..."
docker-compose -f docker-compose.prod.yml up -d

# Ждем запуска базы данных
echo "⏳ Ждем запуска базы данных..."
sleep 10

# Применяем миграции
echo "📊 Применяем миграции..."
docker-compose -f docker-compose.prod.yml exec webapp-server npm run prisma:migrate

# Заполняем базу тестовыми данными
echo "🌱 Заполняем базу тестовыми данными..."
docker-compose -f docker-compose.prod.yml exec webapp-server npm run prisma:seed

# Проверяем статус
echo "✅ Проверяем статус контейнеров..."
docker-compose -f docker-compose.prod.yml ps

echo "🎉 Развертывание завершено!"
echo "🌐 WebApp доступен по адресу: http://109.248.11.230"
echo "🔧 Админ-панель: http://109.248.11.230/admin"
echo "📡 API: http://109.248.11.230/api"
