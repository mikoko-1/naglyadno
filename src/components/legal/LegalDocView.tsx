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
      <P muted={muted}>о заключении договора об оказании услуг</P>
      <P muted={muted}>
        Сайт Исполнителя: {s.siteUrl}. Услуга — доступ к сервису «{s.productName}» ({s.service}
        ): пробный период 3 дня, далее тариф «Плюс» {s.plusPrice} / {s.plusPeriod}. Оплата через{' '}
        {s.paymentPartner}.
      </P>

      <h2 className="mt-6 text-base font-semibold">1. Общие положения</h2>
      <P muted={muted}>
        Настоящая Публичная оферта содержит условия заключения Договора об оказании услуг
        (далее — «Договор»). Это официальное публичное предложение Исполнителя заключить
        Договор в соответствии с п. 2 ст. 437 ГК РФ.
      </P>
      <P muted={muted}>
        Договор считается заключённым с момента совершения Сторонами действий, предусмотренных
        Офертой, и означающих полное принятие её условий без изъятий (акцепт).
      </P>
      <P muted={muted}>
        Акцепт — в том числе: регистрация учётной записи на Сайте; оформление заявки;
        оплата Услуг; иные действия, ясно выражающие согласие.
      </P>

      <h2 className="mt-6 text-base font-semibold">2. Предмет договора</h2>
      <P muted={muted}>
        Исполнитель обязуется оказать Заказчику Услуги, а Заказчик — оплатить их в размере,
        порядке и сроки, установленные Договором и сведениями на Сайте {s.siteUrl}.
      </P>
      <P muted={muted}>
        Наименование, объём и условия Услуг определяются при оформлении заявки либо указаны на
        Сайте. Исполнитель оказывает Услуги лично либо с привлечением третьих лиц, отвечая за
        их действия как за свои.
      </P>

      <h2 className="mt-6 text-base font-semibold">3. Права и обязанности</h2>
      <P muted={muted}>
        Исполнитель оказывает Услуги в сроки и объёме по Договору и Сайту; предоставляет доступ
        к разделам Сайта; обеспечивает конфиденциальность персональных данных согласно{' '}
        <button type="button" className="font-semibold text-indigo-500" onClick={() => onOpenDoc('privacy')}>
          Политике конфиденциальности
        </button>
        .
      </P>
      <P muted={muted}>
        Исполнитель вправе изменять сроки оказания Услуг и условия Оферты в одностороннем
        порядке, публикуя изменения на Сайте; новые условия действуют для вновь заключаемых
        Договоров.
      </P>
      <P muted={muted}>
        Заказчик обязан указывать достоверные данные; не копировать и не передавать третьим
        лицам материалы Услуг (кроме личного использования); принять оказанные Услуги.
      </P>
      <P muted={muted}>
        Заказчик вправе требовать возврат средств за неоказанные, некачественные услуги или
        отказ по основаниям, предусмотренным законодательством РФ.
      </P>

      <h2 className="mt-6 text-base font-semibold">4. Цена и расчёты</h2>
      <P muted={muted}>
        Стоимость и порядок оплаты — по сведениям на Сайте {s.siteUrl} (тариф «Плюс» —{' '}
        {s.plusPrice} за {s.plusPeriod}). Расчёты безналичные через {s.paymentPartner}.
      </P>

      <h2 className="mt-6 text-base font-semibold">5. Конфиденциальность</h2>
      <P muted={muted}>
        Стороны обеспечивают конфиденциальность персональных данных по 152-ФЗ и 149-ФЗ и не
        разглашают информацию, полученную при исполнении Договора, за исключениями по закону.
      </P>

      <h2 className="mt-6 text-base font-semibold">6. Форс-мажор</h2>
      <P muted={muted}>
        Стороны освобождаются от ответственности при обстоятельствах непреодолимой силы
        (запреты властей, эпидемии, стихийные бедствия и т.п.). Уведомление — в течение 30
        рабочих дней. Если обстоятельства длятся более 60 рабочих дней, любая Сторона вправе
        отказаться от Договора в одностороннем порядке.
      </P>

      <h2 className="mt-6 text-base font-semibold">7. Ответственность</h2>
      <P muted={muted}>
        Стороны несут ответственность по Оферте и законодательству РФ. Исполнитель не отвечает
        за нарушения по вине Заказчика. Убытки возмещаются в порядке, установленном законом.
      </P>

      <h2 className="mt-6 text-base font-semibold">8. Срок действия</h2>
      <P muted={muted}>
        Оферта действует с момента размещения на Сайте до отзыва Исполнителем. Договор действует
        с акцепта до полного исполнения обязательств. Изменения Оферты на Сайте считаются
        принятыми Заказчиком в полном объёме.
      </P>

      <h2 className="mt-6 text-base font-semibold">9. Дополнительные условия</h2>
      <P muted={muted}>
        Применяется право РФ. Споры — сначала в претензионном порядке, затем в суде по
        законодательству РФ. Язык Договора и переписки — русский.
      </P>

      <h2 className="mt-6 text-base font-semibold">10. Реквизиты Исполнителя</h2>
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
        <br />
        Сайт: {s.siteUrl}
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
        2.4. Данные платежей обрабатывает Робокасса; Исполнитель получает статус оплаты и
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
        Хостинг и база — Supabase; платежи — Робокасса; ответы ИИ — провайдер нейросети (через
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
