/**
 * Сервер сайта + отправка заявок в Telegram
 */
require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3003;
const SITE_URL = process.env.SITE_URL || 'https://nabiullin-mgn.ru';
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

app.set('trust proxy', 1);
app.use(express.json({ limit: '16kb' }));
app.use(express.static(__dirname, {
  maxAge: '7d',
  etag: true,
  setHeaders(res, filePath) {
    if (/\.(html|css|js)$/i.test(filePath)) {
      res.setHeader('Cache-Control', 'no-cache');
    }
  },
}));

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatMessage({ name, phone, telegram }) {
  const lines = [
    '🎤 <b>Новая заявка с сайта</b>',
    '',
    `<b>Имя:</b> ${escapeHtml(name)}`,
    `<b>Телефон:</b> ${escapeHtml(phone)}`,
  ];
  if (telegram?.trim()) {
    lines.push(`<b>Telegram:</b> ${escapeHtml(telegram.trim())}`);
  }
  lines.push('', `<i>${new Date().toLocaleString('ru-RU', { timeZone: 'Asia/Yekaterinburg' })} · Магнитогорск</i>`);
  return lines.join('\n');
}

async function sendToTelegram(text) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    }),
  });

  const data = await res.json();
  if (!data.ok) {
    throw new Error(data.description || 'Telegram API error');
  }
  return data;
}

app.get('/api/health', (req, res) => {
  res.json({ ok: true, site: SITE_URL });
});

app.post('/api/contact', async (req, res) => {
  if (!BOT_TOKEN || !CHAT_ID) {
    return res.status(503).json({ ok: false, error: 'Telegram не настроен на сервере' });
  }

  const name = (req.body?.name || '').trim();
  const phone = (req.body?.phone || '').trim();
  const telegram = (req.body?.telegram || '').trim();

  if (!name || name.length > 100) {
    return res.status(400).json({ ok: false, error: 'Укажите имя' });
  }
  if (!phone || phone.length > 30) {
    return res.status(400).json({ ok: false, error: 'Укажите телефон' });
  }
  if (telegram.length > 64) {
    return res.status(400).json({ ok: false, error: 'Слишком длинный Telegram' });
  }

  try {
    await sendToTelegram(formatMessage({ name, phone, telegram }));
    return res.json({ ok: true });
  } catch (err) {
    console.error('Telegram error:', err.message);
    return res.status(502).json({ ok: false, error: 'Не удалось отправить заявку' });
  }
});

app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ ok: false, error: 'Not found' });
  }
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Сайт: ${SITE_URL} (порт ${PORT})`);
  if (!BOT_TOKEN || !CHAT_ID) {
    console.warn('⚠ TELEGRAM_BOT_TOKEN или TELEGRAM_CHAT_ID не заданы — форма не будет работать');
  } else {
    console.log('✓ Telegram-уведомления включены');
  }
});
