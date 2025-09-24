#!/bin/bash

echo "🚀 Быстрое исправление на сервере..."

# Подключаемся к серверу и исправляем
ssh -o StrictHostKeyChecking=no root@109.248.11.230 << 'EOF'
cd /root/WebApp

echo "🔧 Исправляем TypeScript ошибки..."

# Исправляем admin.ts - заменяем только неиспользуемые req
sed -i 's/async (req, res, next) => {/async (_req, res, next) => {/g' server/src/routes/admin.ts

# Возвращаем req обратно там где он используется
sed -i 's/const { stock } = _req.body;/const { stock } = req.body;/g' server/src/routes/admin.ts
sed -i 's/const { id } = _req.params;/const { id } = req.params;/g' server/src/routes/admin.ts
sed -i 's/const data = createCategorySchema.parse(_req.body);/const data = createCategorySchema.parse(req.body);/g' server/src/routes/admin.ts
sed -i 's/const data = updateCategorySchema.parse(_req.body);/const data = updateCategorySchema.parse(req.body);/g' server/src/routes/admin.ts
sed -i 's/const data = createMediaSchema.parse(_req.body);/const data = createMediaSchema.parse(req.body);/g' server/src/routes/admin.ts
sed -i 's/const { order } = _req.body;/const { order } = req.body;/g' server/src/routes/admin.ts
sed -i 's/const { mediaIds } = _req.body;/const { mediaIds } = req.body;/g' server/src/routes/admin.ts
sed -i 's/const { productIds, categoryIds, ...data } = createDiscountSchema.parse(_req.body);/const { productIds, categoryIds, ...data } = createDiscountSchema.parse(req.body);/g' server/src/routes/admin.ts
sed -i 's/const { productIds, categoryIds, ...data } = updateDiscountSchema.parse(_req.body);/const { productIds, categoryIds, ...data } = updateDiscountSchema.parse(req.body);/g' server/src/routes/admin.ts
sed -i 's/const query = orderQuerySchema.parse(_req.query);/const query = orderQuerySchema.parse(req.query);/g' server/src/routes/admin.ts
sed -i 's/const { status } = _req.body;/const { status } = req.body;/g' server/src/routes/admin.ts

# Исправляем catalog.ts
sed -i 's/async (_req, res, next) => {/async (req, res, next) => {/g' server/src/routes/catalog.ts

# Исправляем payment.test.ts
sed -i 's/data: {/data: {\n        number: 1,/g' server/src/tests/payment.test.ts

echo "✅ Исправления применены!"

# Собираем сервер
echo "🔨 Собираем сервер..."
npm run build:server

# Запускаем сервисы
echo "🚀 Запускаем сервисы..."
pm2 restart all
systemctl restart nginx

echo "🎉 Готово!"
EOF

echo "✅ Исправления применены на сервере!"
