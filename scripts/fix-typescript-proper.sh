#!/bin/bash

echo "🔧 Правильно исправляем TypeScript ошибки..."

# Переходим в директорию проекта
cd /root/WebApp

# Исправляем ошибки в server/src/routes/admin.ts
echo "Исправляем admin.ts..."
# Заменяем только неиспользуемые req на _req
sed -i 's/async (req, res, next) => {/async (_req, res, next) => {/g' server/src/routes/admin.ts
# Но нужно вернуть req обратно там где он используется
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

# Исправляем ошибки в server/src/routes/catalog.ts
echo "Исправляем catalog.ts..."
sed -i 's/async (_req, res, next) => {/async (req, res, next) => {/g' server/src/routes/catalog.ts

# Исправляем ошибки в server/src/routes/order.ts
echo "Исправляем order.ts..."
# Ничего не меняем, там все правильно

# Исправляем ошибки в server/src/routes/payment.ts
echo "Исправляем payment.ts..."
# Ничего не меняем, там все правильно

# Исправляем ошибки в server/src/tests/payment.test.ts
echo "Исправляем payment.test.ts..."
sed -i 's/data: {/data: {\n        number: 1,/g' server/src/tests/payment.test.ts

echo "✅ Исправления применены!"

# Пытаемся собрать сервер
echo "🔨 Собираем сервер..."
npm run build:server

echo "🎉 Готово!"
