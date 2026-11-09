# Деплой Наглядно на Timeweb + Робокасса

Боевой сайт: **https://naglyadno-math.site** (Timeweb Cloud App Platform).  
Бэкенд: Supabase (Auth, БД, Edge: Сократ и оплата).

## 1. База и функции

1. SQL Editor → выполнить:
   - `supabase/migrations/001_init.sql`
   - `supabase/migrations/002_payments_plus_only.sql`
   - `supabase/migrations/003_trial_ends_at.sql`
2. Edge Functions → Secrets:
   - `GEMINI_API_KEY`
   - `ROBOKASSA_LOGIN` — идентификатор магазина
   - `ROBOKASSA_PASSWORD1` — пароль #1 (платёжная ссылка)
   - `ROBOKASSA_PASSWORD2` — пароль #2 (Result URL)
   - опционально `ROBOKASSA_IS_TEST=1` для тестового режима
3. Задеплоить функции:
   - `socrates`
   - `create-payment`
   - `robokassa-result` (**Verify JWT = OFF**)
4. В кабинете Робокассы:
   - **Result URL:** `https://ongbagumbavgqrpogauz.supabase.co/functions/v1/robokassa-result`
   - **Success URL:** `https://naglyadno-math.site/?paid=1`
   - **Fail URL:** `https://naglyadno-math.site/?paid=0`
   - метод Result: GET или POST

## 2. Сборка фронта (App Platform)

Переменные:
```
VITE_BASE_PATH=/
VITE_SUPABASE_URL=https://ongbagumbavgqrpogauz.supabase.co
VITE_SUPABASE_ANON_KEY=...
```

Автодеплой с GitHub `mikoko-1/naglyadno` → `main`.

## 3. Проверка

1. https://naglyadno-math.site — оферта / контакты
2. Регистрация → Аккаунт
3. Сократ
4. «Оформить Плюс» → Робокасса (сначала тест)
5. После оплаты `/?paid=1` → план Плюс

## 4. Тарифы

- Пробный: 3 дня полного доступа после онбординга
- Плюс: 690 ₽ / 30 дней (разовый платёж через Робокассу)
