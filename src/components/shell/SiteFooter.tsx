import { SELLER, type LegalDocId } from '../../lib/legal/seller.ts';

type SiteFooterProps = {
  dark?: boolean;
  onOpenLegal: (doc: LegalDocId) => void;
};

export function SiteFooter({ dark, onOpenLegal }: SiteFooterProps) {
  const muted = dark ? 'text-slate-500' : 'text-slate-500';
  const link = 'font-medium text-indigo-500 hover:underline';

  return (
    <footer className={`mx-auto mt-10 max-w-5xl border-t px-4 py-6 sm:px-6 ${dark ? 'border-white/10' : 'border-slate-200'}`}>
      <p className={`text-xs leading-relaxed ${muted}`}>
        {SELLER.fullName} · ИНН {SELLER.inn} · {SELLER.status}
      </p>
      <p className={`mt-1 text-xs ${muted}`}>
        <a className={link} href={SELLER.emailHref}>
          {SELLER.email}
        </a>
        {' · '}
        <a className={link} href={SELLER.phoneHref}>
          {SELLER.phone}
        </a>
      </p>
      <nav className={`mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs ${muted}`} aria-label="Правовая информация">
        <button type="button" className={link} onClick={() => onOpenLegal('offer')}>
          Оферта
        </button>
        <button type="button" className={link} onClick={() => onOpenLegal('privacy')}>
          Конфиденциальность
        </button>
        <button type="button" className={link} onClick={() => onOpenLegal('contacts')}>
          Контакты
        </button>
      </nav>
      <p className={`mt-3 text-[11px] ${muted}`}>
        «{SELLER.productName}» ({SELLER.siteUrl}) — {SELLER.service}. Плюс: {SELLER.plusPrice} /{' '}
        {SELLER.plusPeriod}.
      </p>
    </footer>
  );
}
