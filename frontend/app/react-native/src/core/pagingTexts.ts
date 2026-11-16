import { chromeLanguageOf, type ChromeLanguage } from './chromeLanguage.ts';

/** The listing pager's own words: its caption and its two buttons. */
export interface PagingTexts {
  previous: string;
  next: string;
  /** "Page 2 of 6 · 57 items" — the caption under a paged listing. */
  caption: (page: number, pages: number, total: number) => string;
}

const TEXTS: Record<ChromeLanguage, PagingTexts> = {
  en: {
    previous: 'Previous page',
    next: 'Next page',
    caption: (p, n, t) => `Page ${p} of ${n} · ${t === 1 ? '1 item' : `${t} items`}`,
  },
  es: {
    previous: 'Página anterior',
    next: 'Página siguiente',
    caption: (p, n, t) => `Página ${p} de ${n} · ${t === 1 ? '1 elemento' : `${t} elementos`}`,
  },
  fr: {
    previous: 'Page précédente',
    next: 'Page suivante',
    caption: (p, n, t) => `Page ${p} sur ${n} · ${t === 1 ? '1 élément' : `${t} éléments`}`,
  },
  de: {
    previous: 'Vorherige Seite',
    next: 'Nächste Seite',
    caption: (p, n, t) => `Seite ${p} von ${n} · ${t === 1 ? '1 Eintrag' : `${t} Einträge`}`,
  },
  pt: {
    previous: 'Página anterior',
    next: 'Próxima página',
    caption: (p, n, t) => `Página ${p} de ${n} · ${t === 1 ? '1 item' : `${t} itens`}`,
  },
  it: {
    previous: 'Pagina precedente',
    next: 'Pagina successiva',
    caption: (p, n, t) => `Pagina ${p} di ${n} · ${t === 1 ? '1 elemento' : `${t} elementi`}`,
  },
};

export function pagingTexts(locale: string | null | undefined): PagingTexts {
  return TEXTS[chromeLanguageOf(locale)];
}

/** Every language's texts (the completeness test reads them). */
export const ALL_PAGING_TEXTS: Readonly<Record<ChromeLanguage, PagingTexts>> = TEXTS;
