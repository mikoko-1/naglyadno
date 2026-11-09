# Наглядно — математика 5–9

Интерактивная платформа: уроки, Сократ, контрольные, радар слабых мест.

```bash
npm install
npm run dev
```

**Прод:** https://naglyadno-math.site (Timeweb Cloud) — см. [`DEPLOY.md`](DEPLOY.md).  
Стейджинг (опционально): https://mikoko-1.github.io/naglyadno/

## Модули

- **Учебный год** — 36 недель, темп на 9 месяцев
- **Онбординг** — класс + диагностика → годовой трек
- **План на день** — пробел → Сократ → короткий срез
- **Сократ** — по шагам; на Старте 5 сообщений/день (Edge → Gemini, без VPN)
- **Бесконечная контрольная** — экспресс / полный / хирургия (Плюс)
- **Радар** — микро-навыки
- **Кабинет родителя** — недельный отчёт (Плюс)
- **Аккаунт** — 3 дня пробный / **Плюс 690 ₽/мес** (Робокасса)
- **Облако (Supabase)** — вход и синк прогресса

Без `.env` сайт работает на `localStorage`.

## Облако

1. Supabase Free → SQL Editor: [`001_init.sql`](supabase/migrations/001_init.sql), затем [`002_payments_plus_only.sql`](supabase/migrations/002_payments_plus_only.sql).
2. Auth → Email.
3. `.env`: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_BASE_PATH=/`.
4. Secrets Edge: `GEMINI_API_KEY`, позже `ROBOKASSA_LOGIN` + `PASSWORD1/2`.
5. Функции: `socrates`, `create-payment`, `robokassa-result` (JWT off у Result URL).

## Оплата

Кнопка «Оплатить» → Edge `create-payment` → Робокасса → Result URL выставляет `profiles.plan=plus` на 30 дней.  
Ключи только на сервере. Подробности: [`DEPLOY.md`](DEPLOY.md).

## Структура

- `src/curriculum/` · `src/content/lessons/`
- `src/lib/supabase/` · `src/lib/billing/` · `src/lib/socratic/`
- `supabase/functions/` · `supabase/migrations/`
- [`DEPLOY.md`](DEPLOY.md) — Timeweb + Nginx + HTTPS

Путь темы: **Урок → Тренажёр → Практика → Тест**.
