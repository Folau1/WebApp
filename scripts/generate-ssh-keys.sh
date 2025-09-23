#!/bin/bash

# Скрипт для генерации SSH ключей для GitHub Actions
# Запускать на локальном компьютере

echo "🔑 Генерируем SSH ключи для GitHub Actions..."

# Создаем директорию для ключей
mkdir -p ~/.ssh/github-actions
cd ~/.ssh/github-actions

# Генерируем SSH ключ
ssh-keygen -t rsa -b 4096 -C "github-actions@webapp" -f webapp_deploy_key -N ""

echo "✅ SSH ключи созданы!"
echo ""
echo "📋 Инструкции по настройке:"
echo ""
echo "1. Добавьте публичный ключ на сервер:"
echo "   ssh-copy-id -i ~/.ssh/github-actions/webapp_deploy_key.pub root@109.248.11.230"
echo ""
echo "2. Добавьте приватный ключ в GitHub Secrets:"
echo "   - Перейдите в Settings → Secrets and variables → Actions"
echo "   - Добавьте новый secret с именем 'SERVER_SSH_KEY'"
echo "   - Скопируйте содержимое файла:"
echo ""
echo "   cat ~/.ssh/github-actions/webapp_deploy_key"
echo ""
echo "3. Добавьте другие secrets:"
echo "   - SERVER_HOST: 109.248.11.230"
echo "   - SERVER_USER: root"
echo "   - SERVER_PORT: 22"
echo ""
echo "🔒 Безопасность:"
echo "   - Никогда не коммитьте приватные ключи в репозиторий"
echo "   - Храните ключи в безопасном месте"
echo "   - Регулярно обновляйте ключи"
