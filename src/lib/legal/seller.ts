/** Реквизиты продавца (самозанятый) — для оферты, политики и футера. */
export const SELLER = {
  fullName: 'Колбасинов Виктор Федорович',
  inn: '550722166804',
  phone: '+7 962 055 00 65',
  phoneHref: 'tel:+79620550065',
  email: 'mikolbasinov@gmail.com',
  emailHref: 'mailto:mikolbasinov@gmail.com',
  status: 'плательщик налога на профессиональный доход (самозанятый)',
  productName: 'Наглядно',
  service: 'онлайн-сервис изучения математики (5–9 классы) с ИИ-ментором «Сократ»',
  plusPrice: '690 ₽',
  plusPeriod: '30 календарных дней',
  siteUrl: 'https://naglyadno-math.site',
} as const;

export type LegalDocId = 'offer' | 'privacy' | 'contacts';

export const LEGAL_DOC_TITLES: Record<LegalDocId, string> = {
  offer: 'Публичная оферта',
  privacy: 'Политика конфиденциальности',
  contacts: 'Контакты и реквизиты',
};
