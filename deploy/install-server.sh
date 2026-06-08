#!/bin/bash
# Однократная настройка VPS (Ubuntu/Debian)
# Запуск на сервере: sudo bash deploy/install-server.sh

set -euo pipefail

APP_DIR="/var/www/nabiullin"
DOMAIN="nabiullin-mgn.ru"
NGINX_CONF="deploy/nginx/${DOMAIN}.conf"

echo "==> Установка Docker..."
if ! command -v docker &>/dev/null; then
  apt-get update
  apt-get install -y ca-certificates curl gnupg
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  chmod a+r /etc/apt/keyrings/docker.gpg
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
    > /etc/apt/sources.list.d/docker.list
  apt-get update
  apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
fi

echo "==> Установка nginx и certbot..."
apt-get install -y nginx certbot python3-certbot-nginx

echo "==> Папка проекта: ${APP_DIR}"
mkdir -p /var/www/certbot
mkdir -p "${APP_DIR}"

if [ -f "${APP_DIR}/${NGINX_CONF}" ] || [ -f "${APP_DIR}/deploy/nginx/${DOMAIN}.conf" ]; then
  cp "${APP_DIR}/deploy/nginx/${DOMAIN}.conf" "/etc/nginx/sites-available/${DOMAIN}"
  ln -sf "/etc/nginx/sites-available/${DOMAIN}" "/etc/nginx/sites-enabled/${DOMAIN}"
  rm -f /etc/nginx/sites-enabled/default
fi

echo "==> Firewall (ufw)..."
if command -v ufw &>/dev/null; then
  ufw allow OpenSSH
  ufw allow 'Nginx Full'
  ufw --force enable || true
fi

echo ""
echo "Готово. Дальше:"
echo "  1. Скопируйте проект в ${APP_DIR}"
echo "  2. Создайте ${APP_DIR}/.env (из .env.example)"
echo "  3. cd ${APP_DIR} && docker compose up -d --build"
echo "  4. sudo certbot --nginx -d ${DOMAIN} -d www.${DOMAIN}"
echo "  5. sudo nginx -t && sudo systemctl reload nginx"
