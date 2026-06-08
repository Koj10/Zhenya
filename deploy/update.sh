#!/bin/bash
# Обновление сайта на сервере (запускать из папки проекта)
set -euo pipefail

cd "$(dirname "$0")/.."

echo "==> Сборка media.json..."
node build-vap.js

echo "==> Пересборка и перезапуск контейнера..."
docker compose up -d --build

echo "==> Статус..."
docker compose ps

echo "✓ Готово: https://nabiullin-mgn.ru"
