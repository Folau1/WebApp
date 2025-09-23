#!/bin/bash

# Скрипт для первоначальной настройки сервера
# Запускать на сервере: bash setup-server.sh

set -e

echo "🚀 Начинаем настройку сервера..."

# Обновляем систему
echo "📦 Обновляем систему..."
apt update && apt upgrade -y

# Устанавливаем необходимые пакеты
echo "🔧 Устанавливаем необходимые пакеты..."
apt install -y curl wget git nginx certbot python3-certbot-nginx

# Устанавливаем Node.js 18+
echo "📦 Устанавливаем Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Проверяем версии
echo "✅ Проверяем версии:"
node --version
npm --version

# Устанавливаем Docker
echo "🐳 Устанавливаем Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
rm get-docker.sh

# Устанавливаем Docker Compose
echo "🐳 Устанавливаем Docker Compose..."
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Проверяем установку Docker
echo "✅ Проверяем Docker:"
docker --version
docker-compose --version

# Устанавливаем PM2 для управления процессами
echo "⚡ Устанавливаем PM2..."
npm install -g pm2

# Создаем директорию для проекта
echo "📁 Создаем директорию проекта..."
mkdir -p /root/WebApp
cd /root/WebApp

# Клонируем репозиторий
echo "📥 Клонируем репозиторий..."
git clone https://github.com/Folau1/WebApp.git .

# Устанавливаем зависимости
echo "📦 Устанавливаем зависимости..."
npm install

# Создаем файл .env
echo "⚙️ Создаем файл .env..."
cp env.example .env

# Настраиваем Nginx
echo "🌐 Настраиваем Nginx..."
cat > /etc/nginx/sites-available/webapp << EOF
server {
    listen 80;
    server_name 109.248.11.230;

    # WebApp (React)
    location / {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Admin Panel
    location /admin {
        proxy_pass http://localhost:5174;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Активируем сайт
ln -sf /etc/nginx/sites-available/webapp /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Перезапускаем Nginx
systemctl restart nginx
systemctl enable nginx

# Создаем конфигурацию PM2
echo "⚡ Создаем конфигурацию PM2..."
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [
    {
      name: 'webapp-server',
      script: 'server/src/index.ts',
      cwd: '/root/WebApp',
      interpreter: 'npx',
      interpreter_args: 'tsx',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G'
    }
  ]
};
EOF

# Запускаем базу данных
echo "🗄️ Запускаем базу данных..."
docker-compose -f docker-compose.dev.yml up -d

# Ждем запуска базы данных
echo "⏳ Ждем запуска базы данных..."
sleep 10

# Применяем миграции
echo "🗄️ Применяем миграции..."
npm run prisma:migrate

# Заполняем базу тестовыми данными
echo "🌱 Заполняем базу тестовыми данными..."
npm run prisma:seed

# Собираем приложение
echo "🔨 Собираем приложение..."
npm run build

# Запускаем приложение через PM2
echo "🚀 Запускаем приложение..."
pm2 start ecosystem.config.js
pm2 save
pm2 startup

echo "✅ Настройка сервера завершена!"
echo "🌐 Приложение доступно по адресу: http://109.248.11.230"
echo "👨‍💼 Админ-панель: http://109.248.11.230/admin"
echo "🔧 API: http://109.248.11.230/api"
