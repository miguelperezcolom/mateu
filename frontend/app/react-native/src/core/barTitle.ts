/**
 * Who owns the screen's title (RN-22): the Material top app bar names the DESTINATION — the screen
 * on view — not the app. The app's own name stays where it identifies the app: the drawer's header,
 * and the bar while no screen has named itself yet (the first load, a screen with no title).
 *
 * Once the bar shows the screen's title, the page body does not repeat it: a page header whose title
 * IS the bar's drops its title line (its subtitle, toolbar and the rest stay). A body title that says
 * something else (a section, a record named differently) is left alone.
 */

/** The text the top app bar shows: the screen's title, else the app's, else the hub's name for it. */
export function barTitleOf(screenTitle: string | null | undefined, appTitle?: string | null, uiName?: string | null): string {
  const screen = (screenTitle ?? '').trim();
  if (screen) return screen;
  return (appTitle ?? '').trim() || (uiName ?? '').trim() || 'Mateu';
}

const normal = (text: string) => text.replace(/\s+/g, ' ').trim().toLowerCase();

/** Whether a page header's title only repeats what the bar already says. No bar → never. */
export function bodyRepeatsBar(bodyTitle: string | null | undefined, barTitle: string | null | undefined): boolean {
  if (!bodyTitle || !barTitle) return false;
  return normal(bodyTitle) === normal(barTitle);
}
