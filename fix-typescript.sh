#!/bin/bash

echo "🔧 Исправляем TypeScript ошибки..."

# Переходим в директорию проекта
cd /root/WebApp

# Исправляем ошибки в server/src/routes/admin.ts
echo "Исправляем admin.ts..."
sed -i 's/async (req, res, next) => {/async (_req, res, next) => {/g' server/src/routes/admin.ts
sed -i 's/async (req, res, next) => {/async (req, res, next) => {/g' server/src/routes/admin.ts

# Исправляем ошибки в server/src/routes/catalog.ts
echo "Исправляем catalog.ts..."
sed -i 's/async (req, res, next) => {/async (_req, res, next) => {/g' server/src/routes/catalog.ts

# Исправляем ошибки в server/src/routes/order.ts
echo "Исправляем order.ts..."
sed -i 's/async (req, res, next) => {/async (req, res, next) => {/g' server/src/routes/order.ts

# Исправляем ошибки в server/src/routes/payment.ts
echo "Исправляем payment.ts..."
sed -i 's/async (req, res, next) => {/async (req, res, next) => {/g' server/src/routes/payment.ts

# Исправляем ошибки в server/src/tests/payment.test.ts
echo "Исправляем payment.test.ts..."
sed -i 's/data: {/data: {\n        number: 1,/g' server/src/tests/payment.test.ts

echo "✅ Исправления применены!"

# Пытаемся собрать сервер
echo "🔨 Собираем сервер..."
npm run build:server

echo "🎉 Готово!"
