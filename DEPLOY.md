# Деплой на сервер 147.45.48.101

**Домен:** https://nabiullin-mgn.ru  
**Сервер:** `147.45.48.101`  
**Стек:** Docker + nginx + Let's Encrypt

---

## 1. DNS (у регистратора домена)

| Тип | Имя | Значение |
|-----|-----|----------|
| A | `@` | `147.45.48.101` |
| A | `www` | `147.45.48.101` |

Подождите 5–30 минут после сохранения.

---

## 2. Подключение к серверу

```bash
ssh root@147.45.48.101
```

---

## 3. Первичная настройка сервера

```bash
# Скопируйте проект на сервер (с локального ПК):
scp -r . root@147.45.48.101:/var/www/nabiullin

# На сервере:
cd /var/www/nabiullin
sudo bash deploy/install-server.sh
```

---

## 4. Переменные окружения

```bash
cd /var/www/nabiullin
cp .env.example .env
nano .env
```

Заполните:

```env
TELEGRAM_BOT_TOKEN=ваш_токен
TELEGRAM_CHAT_ID=-5004253620
PORT=3000
NODE_ENV=production
SITE_URL=https://nabiullin-mgn.ru
```

---

## 5. Запуск Docker

```bash
cd /var/www/nabiullin
docker compose up -d --build
docker compose ps
curl http://127.0.0.1:3000/api/health
```

---

## 6. nginx (до SSL)

```bash
sudo cp deploy/nginx/nabiullin-mgn.ru.init.conf /etc/nginx/sites-available/nabiullin-mgn.ru
sudo ln -sf /etc/nginx/sites-available/nabiullin-mgn.ru /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

Проверка: http://nabiullin-mgn.ru

---

## 7. SSL-сертификат

```bash
sudo certbot --nginx -d nabiullin-mgn.ru -d www.nabiullin-mgn.ru
```

После certbot замените конфиг на полный (с HTTPS):

```bash
sudo cp deploy/nginx/nabiullin-mgn.ru.conf /etc/nginx/sites-available/nabiullin-mgn.ru
sudo nginx -t && sudo systemctl reload nginx
```

Проверка: https://nabiullin-mgn.ru

---

## 8. Обновление сайта

После изменений (новые фото в `VaP/`, правки кода):

```bash
# С локального ПК — залить файлы:
scp -r . root@147.45.48.101:/var/www/nabiullin

# На сервере:
cd /var/www/nabiullin
bash deploy/update.sh
```

---

## 9. SEO после деплоя

1. [Яндекс.Вебмастер](https://webmaster.yandex.ru) — добавить сайт, отправить sitemap:  
   `https://nabiullin-mgn.ru/sitemap.xml`
2. [Google Search Console](https://search.google.com/search-console) — то же самое
3. В `index.html` вставить коды верификации вместо плейсхолдеров

---

## Архитектура

```
Интернет → nginx :443 → 127.0.0.1:3000 (Docker)
                         ├── статика (HTML, CSS, JS, VaP)
                         └── POST /api/contact → Telegram
```

Порт 3000 снаружи **не открыт** — только nginx на 80/443.
