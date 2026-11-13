/**
 * What a render boundary (ui/RenderBoundary.tsx) says when the components it holds threw while being
 * drawn — a server one minor ahead, a hand-written static bundle or a third-party UI sending a shape
 * this renderer does not expect. Pure: unit-tested with node --test.
 *
 * Without a boundary an exception during render unmounts the whole React root (fatal in a release
 * build): in the hub that takes down every open UI, a half-filled form included. A boundary keeps
 * the failure to the screen, overlay or UI that drew it, like IntelliJ's "Render failed" and
 * Redwood's "Unsupported component".
 */
import { chromeLanguageOf, type ChromeLanguage } from './chromeLanguage.ts';

export interface RenderFailureTexts {
  title: string;
  detail: string;
  retry: string;
}

const TEXTS: Record<ChromeLanguage, RenderFailureTexts> = {
  en: { title: 'This part could not be shown', detail: 'Something on this screen could not be drawn.', retry: 'Try again' },
  es: { title: 'No se ha podido mostrar esta parte', detail: 'Algo de esta pantalla no se ha podido dibujar.', retry: 'Reintentar' },
  fr: { title: "Cette partie n'a pas pu être affichée", detail: "Un élément de cet écran n'a pas pu être dessiné.", retry: 'Réessayer' },
  de: { title: 'Dieser Teil konnte nicht angezeigt werden', detail: 'Etwas auf diesem Bildschirm konnte nicht dargestellt werden.', retry: 'Erneut versuchen' },
  pt: { title: 'Não foi possível mostrar esta parte', detail: 'Algo neste ecrã não pôde ser desenhado.', retry: 'Tentar novamente' },
  it: { title: 'Impossibile mostrare questa parte', detail: 'Qualcosa in questa schermata non è stato disegnato.', retry: 'Riprova' },
};

/** The texts of a render failure in the UI's chrome language. */
export function renderFailureTexts(locale: string | null | undefined): RenderFailureTexts {
  return TEXTS[chromeLanguageOf(locale)];
}

/** The error's own words, for the developer (shown in a dev build only), never more than a line. */
export function renderFailureDetail(error: unknown): string {
  const text = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
  return text.length > 200 ? `${text.slice(0, 199)}…` : text;
}

/** The state a boundary takes from a thrown error (React's getDerivedStateFromError). */
export function failedStateOf(error: unknown): { failed: true; error: unknown } {
  return { failed: true, error };
}

/** Whether a boundary that failed should draw its children again: the user asked (`attempt`
 *  moved) or what it holds changed (`resetKey` moved — a new screen, a new answer). */
export function shouldReset(prev: { attempt: number; resetKey: unknown }, next: { attempt: number; resetKey: unknown }): boolean {
  return prev.attempt !== next.attempt || !Object.is(prev.resetKey, next.resetKey);
}

/** Every language has the same keys (pinned by the completeness test). */
export const RENDER_FAILURE_LANGUAGES = Object.keys(TEXTS) as ChromeLanguage[];
