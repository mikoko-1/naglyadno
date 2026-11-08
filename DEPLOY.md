# Деплой Наглядно на Timeweb + ЮKassa

Боевой сайт — **свой домен на Timeweb**. Supabase остаётся бэкендом (Auth, БД, Edge: Сократ и оплата).

## 1. База и функции

1. SQL Editor → выполнить по очереди:
   - [`supabase/migrations/001_init.sql`](supabase/migrations/001_init.sql)
   - [`supabase/migrations/002_payments_plus_only.sql`](supabase/migrations/002_payments_plus_only.sql)
2. Edge Functions → Secrets:
   - `GEMINI_API_KEY` — уже для Сократа
   - `YOOKASSA_SHOP_ID`
   - `YOOKASSA_SECRET_KEY`
   - опционально `SITE_URL=https://naglyadno-math.site`
3. Задеплоить функции (Dashboard → Via Editor или CLI):
   - `socrates`
   - `create-payment` (JWT включён)
   - `yookassa-webhook` (**Verify JWT = OFF** — иначе ЮKassa получит 401)
4. В кабинете ЮKassa → HTTP-уведомления:
   ```
   https://ongbagumbavgqrpogauz.supabase.co/functions/v1/yookassa-webhook
   ```
   Событие: `payment.succeeded` (и при желании `payment.canceled`).

## 2. Сборка фронта

На машине разработчика (или в CI):

```bash
copy .env.example .env
```

В `.env` для **прода** (корень домена, не GitHub Pages):

```
VITE_BASE_PATH=/
VITE_SUPABASE_URL=https://ongbagumbavgqrpogauz.supabase.co
VITE_SUPABASE_ANON_KEY=твой_anon_ключ
```

Без `VITE_GEMINI_API_KEY` — Сократ через Edge.

```bash
npm ci
npm run build
```

Папка `dist/` — это и есть сайт.

## 3. Timeweb

### Вариант A — хостинг сайтов
1. Создай сайт, привяжи домен, включи HTTPS.
2. Залей содержимое `dist/` в корень сайта (index.html рядом с assets/).
3. Если панель умеет «для SPA» — включи. Иначе в `.htaccess` (Apache):

```apache
RewriteEngine On
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

### Вариант B — VPS + Nginx

```nginx
server {
  listen 443 ssl http2;
  server_name naglyadno-math.site;
  root /var/www/naglyadno;
  index index.html;

  # ssl_certificate ... (Let's Encrypt в панели Timeweb)

  location / {
    try_files $uri $uri/ /index.html;
  }

  location /assets/ {
    expires 30d;
    add_header Cache-Control "public, immutable";
  }
}
```

Скопируй `dist/*` в `/var/www/naglyadno`.

## 4. Проверка

1. Открой `https://naglyadno-math.site` **без VPN**.
2. Регистрация → Аккаунт.
3. Сократ отвечает.
4. «Оформить Плюс» → редирект на ЮKassa (сначала test-магазин).
5. После оплаты возврат `/?paid=1` → в аккаунте план **Плюс**.

## 5. Тарифы

- **Старт** — бесплатно, лимиты Сократа/срезов.
- **Плюс** — **690 ₽ / 30 дней** (разовый платёж, продлевает `plan_expires_at`). Рекуррент позже.
