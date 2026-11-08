import { SELLER, type LegalDocId } from '../../lib/legal/seller.ts';

type LegalDocViewProps = {
  doc: LegalDocId;
  dark?: boolean;
  onBack: () => void;
  onOpenDoc: (doc: LegalDocId) => void;
};

export function LegalDocView({ doc, dark, onBack, onOpenDoc }: LegalDocViewProps) {
  const card = dark
    ? 'border-white/10 bg-slate-900/80 text-slate-100'
    : 'border-slate-200/80 bg-white text-slate-900';
  const muted = dark ? 'text-slate-400' : 'text-slate-600';

  return (
    <article className={`rounded-3xl border p-5 shadow-sm sm:p-7 ${card}`}>
      <button
        type="button"
        onClick={onBack}
        className="text-sm font-semibold text-indigo-500 hover:underline"
      >
        ← На главную
      </button>

      {doc === 'offer' && <OfferBody muted={muted} onOpenDoc={onOpenDoc} />}
      {doc === 'privacy' && <PrivacyBody muted={muted} onOpenDoc={onOpenDoc} />}
      {doc === 'contacts' && <ContactsBody muted={muted} />}
    </article>
  );
}

function H({ children }: { children: string }) {
  return <h1 className="mt-4 text-2xl font-bold tracking-tight">{children}</h1>;
}

function P({ children, muted }: { children: React.ReactNode; muted: string }) {
  return <p className={`mt-3 text-sm leading-relaxed ${muted}`}>{children}</p>;
}

function OfferBody({
  muted,
  onOpenDoc,
}: {
  muted: string;
  onOpenDoc: (doc: LegalDocId) => void;
}) {
  const s = SELLER;
  return (
    <div>
      <H>Публичная оферта</H>
      <P muted={muted}>
        о заключении договора на оказание услуг доступа к онлайн-сервису «{s.productName}»
      </P>
      <P muted={muted}>Редакция от 8 ноября 2026 г.</P>

      <h2 className="mt-6 text-base font-semibold">1. Общие положения</h2>
      <P muted={muted}>
        1.1. Настоящий документ является официальным предложением (публичной офертой){' '}
        {s.fullName}, ИНН {s.inn}, статус: {s.status} (далее — Исполнитель), заключить договор
        на условиях ниже с любым дееспособным лицом (далее — Заказчик).
      </P>
      <P muted={muted}>
        1.2. Сайт сервиса: {s.siteUrl}. Акцепт оферты — оплата тарифа «Плюс» на этом сайте
        и/или регистрация аккаунта с последующей оплатой. С момента акцепта договор считается
        заключённым.
      </P>
      <P muted={muted}>
        1.3. Сервис: {s.service}. Доступ предоставляется через интернет после создания
        аккаунта.
      </P>

      <h2 className="mt-6 text-base font-semibold">2. Предмет договора</h2>
      <P muted={muted}>
        2.1. Исполнитель предоставляет Заказчику доступ к функциям сервиса в объёме выбранного
        тарифа: бесплатный «Старт» или платный «Плюс».
      </P>
      <P muted={muted}>
        2.2. Тариф «Плюс»: стоимость {s.plusPrice} за период {s.plusPeriod}. В период действия
        «Плюс» доступны расширенные возможности (безлимит ИИ-ментора «Сократ» в рамках
        разумного использования, план на день, отчёт родителю, расширенные срезы и иное, как
        указано на странице тарифов сервиса).
      </P>
      <P muted={muted}>
        2.3. Оплата — разовый платёж через платёжного партнёра (ЮKassa). Автопродление в
        текущей версии не используется: по окончании периода доступ возвращается к «Старт»,
        пока Заказчик не оплатит «Плюс» снова.
      </P>
      <P muted={muted}>
        2.4. Услуга считается оказанной в части предоставления доступа с момента активации
        «Плюс» в аккаунте Заказчика после подтверждения оплаты.
      </P>

      <h2 className="mt-6 text-base font-semibold">3. Права и обязанности</h2>
      <P muted={muted}>
        3.1. Заказчик обязуется указывать достоверные данные при регистрации, не передавать
        доступ третьим лицам и не использовать сервис незаконно.
      </P>
      <P muted={muted}>
        3.2. Исполнитель обязуется обеспечивать работу сервиса в разумных пределах, устранять
        сбои и защищать персональные данные согласно{' '}
        <button type="button" className="font-semibold text-indigo-500" onClick={() => onOpenDoc('privacy')}>
          Политике конфиденциальности
        </button>
        .
      </P>
      <P muted={muted}>
        3.3. Исполнитель вправе изменять содержание уроков, лимиты тарифа «Старт» и интерфейс,
        уведомляя о существенных изменениях платных условий на сайте.
      </P>

      <h2 className="mt-6 text-base font-semibold">4. Возврат средств</h2>
      <P muted={muted}>
        4.1. Заказчик вправе запросить возврат оплаты «Плюс» в течение 14 календарных дней с
        даты платежа, если доступ «Плюс» ещё не использовался существенно (не более 5
        сообщений Сократу и не более одной платной контрольной после оплаты).
      </P>
      <P muted={muted}>
        4.2. Заявка на возврат — на email {s.email} с указанием email аккаунта и даты платежа.
        Срок рассмотрения — до 10 рабочих дней. Возврат тем же способом, которым была оплата,
        если иное не требуется платёжным партнёром.
      </P>
      <P muted={muted}>
        4.3. При техническом сбое, из‑за которого оплаченный доступ не был предоставлен,
        Исполнитель восстанавливает доступ либо возвращает оплату по обращению Заказчика.
      </P>

      <h2 className="mt-6 text-base font-semibold">5. Ответственность</h2>
      <P muted={muted}>
        5.1. Сервис носит образовательный характер и не заменяет школьную программу, репетитора
        или официальную аттестацию. Результаты обучения зависят от Заказчика (или ученика).
      </P>
      <P muted={muted}>
        5.2. Исполнитель не отвечает за сбои сети, устройств Заказчика и ограничения третьих
        сторон (провайдеры, платёжные системы, поставщики ИИ).
      </P>

      <h2 className="mt-6 text-base font-semibold">6. Реквизиты Исполнителя</h2>
      <P muted={muted}>
        {s.fullName}
        <br />
        ИНН {s.inn}
        <br />
        {s.status}
        <br />
        Тел.: {s.phone}
        <br />
        Email: {s.email}
      </P>
    </div>
  );
}

function PrivacyBody({
  muted,
  onOpenDoc,
}: {
  muted: string;
  onOpenDoc: (doc: LegalDocId) => void;
}) {
  const s = SELLER;
  return (
    <div>
      <H>Политика конфиденциальности</H>
      <P muted={muted}>сервиса «{s.productName}». Редакция от 8 ноября 2026 г.</P>

      <h2 className="mt-6 text-base font-semibold">1. Кто обрабатывает данные</h2>
      <P muted={muted}>
        Оператор: {s.fullName}, ИНН {s.inn}, {s.status}. Контакты:{' '}
        <a className="text-indigo-500" href={s.emailHref}>
          {s.email}
        </a>
        ,{' '}
        <a className="text-indigo-500" href={s.phoneHref}>
          {s.phone}
        </a>
        .
      </P>

      <h2 className="mt-6 text-base font-semibold">2. Какие данные собираем</h2>
      <P muted={muted}>
        2.1. Данные аккаунта: email, имя (если указано), пароль в зашифрованном виде у
        провайдера авторизации (Supabase).
      </P>
      <P muted={muted}>
        2.2. Учебный прогресс: класс, ответы, навыки, активность, выбранный тариф и срок
        подписки.
      </P>
      <P muted={muted}>
        2.3. Сообщения ИИ-ментору «Сократ» — для ответа на запрос и улучшения сервиса.
      </P>
      <P muted={muted}>
        2.4. Данные платежей обрабатывает ЮKassa; Исполнитель получает статус оплаты и
        идентификаторы платежа, необходимые для активации тарифа.
      </P>

      <h2 className="mt-6 text-base font-semibold">3. Цели обработки</h2>
      <P muted={muted}>
        Предоставление доступа к сервису, оплата и активация «Плюс», поддержка пользователей,
        исполнение{' '}
        <button type="button" className="font-semibold text-indigo-500" onClick={() => onOpenDoc('offer')}>
          оферты
        </button>
        , соблюдение закона, защита от злоупотреблений.
      </P>

      <h2 className="mt-6 text-base font-semibold">4. Передача третьим лицам</h2>
      <P muted={muted}>
        Хостинг и база — Supabase; платежи — ЮKassa; ответы ИИ — провайдер нейросети (через
        сервер Исполнителя). Передача — только для работы сервиса, не для продажи баз данных.
      </P>

      <h2 className="mt-6 text-base font-semibold">5. Хранение и права</h2>
      <P muted={muted}>
        Данные хранятся, пока нужен аккаунт и законные сроки. Вы можете запросить доступ,
        исправление или удаление аккаунта, написав на {s.email}. Ответ — в разумный срок, до
        30 дней.
      </P>

      <h2 className="mt-6 text-base font-semibold">6. Cookies и локальные данные</h2>
      <P muted={muted}>
        В браузере могут храниться прогресс и настройки (localStorage) и сессия входа. Это
        нужно для работы сайта.
      </P>
    </div>
  );
}

function ContactsBody({ muted }: { muted: string }) {
  const s = SELLER;
  return (
    <div>
      <H>Контакты и реквизиты</H>
      <P muted={muted}>Продавец услуг сервиса «{s.productName}»</P>
      <dl className={`mt-5 space-y-3 text-sm ${muted}`}>
        <div>
          <dt className="font-semibold text-inherit opacity-90">ФИО</dt>
          <dd>{s.fullName}</dd>
        </div>
        <div>
          <dt className="font-semibold text-inherit opacity-90">Статус</dt>
          <dd className="capitalize">{s.status}</dd>
        </div>
        <div>
          <dt className="font-semibold text-inherit opacity-90">ИНН</dt>
          <dd>{s.inn}</dd>
        </div>
        <div>
          <dt className="font-semibold text-inherit opacity-90">Email</dt>
          <dd>
            <a className="text-indigo-500" href={s.emailHref}>
              {s.email}
            </a>
          </dd>
        </div>
        <div>
          <dt className="font-semibold text-inherit opacity-90">Телефон</dt>
          <dd>
            <a className="text-indigo-500" href={s.phoneHref}>
              {s.phone}
            </a>
          </dd>
        </div>
        <div>
          <dt className="font-semibold text-inherit opacity-90">Сайт</dt>
          <dd>
            <a className="text-indigo-500" href={s.siteUrl}>
              {s.siteUrl}
            </a>
          </dd>
        </div>
        <div>
          <dt className="font-semibold text-inherit opacity-90">Услуга</dt>
          <dd>
            {s.service}. Тариф «Плюс»: {s.plusPrice} / {s.plusPeriod}.
          </dd>
        </div>
      </dl>
    </div>
  );
}
