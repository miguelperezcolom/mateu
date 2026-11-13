import { chromeLanguageOf, type ChromeLanguage } from './chromeLanguage.ts';

/** The renderer's own words about waiting: the server-activity announcement and a failed image. */
export interface LoadingTexts {
  /** Said (politely, once) when the app has been waiting for the server for a moment. */
  loading: string;
  /** The accessible name of an image that could not be loaded. */
  imageFailed: string;
}

const TEXTS: Record<ChromeLanguage, LoadingTexts> = {
  en: { loading: 'Loading…', imageFailed: 'Image could not be loaded' },
  es: { loading: 'Cargando…', imageFailed: 'No se ha podido cargar la imagen' },
  fr: { loading: 'Chargement…', imageFailed: "Impossible de charger l'image" },
  de: { loading: 'Wird geladen…', imageFailed: 'Bild konnte nicht geladen werden' },
  pt: { loading: 'Carregando…', imageFailed: 'Não foi possível carregar a imagem' },
  it: { loading: 'Caricamento…', imageFailed: "Impossibile caricare l'immagine" },
};

export function loadingTexts(locale: string | null | undefined): LoadingTexts {
  return TEXTS[chromeLanguageOf(locale)];
}

/** Every language's texts (the completeness test reads them). */
export const ALL_LOADING_TEXTS: Readonly<Record<ChromeLanguage, LoadingTexts>> = TEXTS;
