/**
 * Hardware-keyboard shortcuts on the native renderer — the pure part, tested with node:test.
 *
 * The same three kinds the web honours, with the web's precedence:
 *  - a screen's `@Action(shortcut)` and `@Tab(shortcut)` (scope `screen`), most recent screen first;
 *  - the app's `@AppShortcut(key)` (scope `app`), only when no screen took the key.
 * The key strings and the matching are the web's (libs/mateu shortcuts.ts): `+`-separated modifiers
 * (ctrl, alt, shift, meta) and a key, matched by the logical key or by the physical code (KeyX /
 * DigitX / NumpadX), so a layout that remaps Ctrl+Alt+<letter> still works. While the user types
 * in a field only combinations with Ctrl/Alt/Meta and the function keys apply (a bare letter is a
 * letter).
 *
 * Where the keys come from: on react-native-web the document's `keydown` (KeyboardShortcutsHost).
 * React Native itself delivers key events only behind an experimental flag (Android, off by default,
 * to the focused view), so a phone or tablet app built with Expo gets no keystrokes to match yet.
 */

/** The part of a keyboard event the matching reads (a DOM KeyboardEvent or RN's KeyEvent). */
export interface KeyLike {
  key: string;
  code?: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  metaKey?: boolean;
}

const partsOf = (shortcut: string) => shortcut.toLowerCase().split('+').map((p) => p.trim()).filter(Boolean);

/** True when the event's modifiers are exactly the shortcut's. */
export function modifiersMatch(shortcut: string, e: KeyLike): boolean {
  const parts = partsOf(shortcut);
  return !!e.ctrlKey === parts.includes('ctrl')
    && !!e.altKey === parts.includes('alt')
    && !!e.shiftKey === parts.includes('shift')
    && !!e.metaKey === parts.includes('meta');
}

/** True when the event presses the shortcut (modifiers AND key). */
export function shortcutMatches(shortcut: string | null | undefined, e: KeyLike): boolean {
  if (!shortcut || !shortcut.trim() || !modifiersMatch(shortcut, e)) return false;
  const parts = partsOf(shortcut);
  const key = parts[parts.length - 1] ?? '';
  if ((e.key ?? '').toLowerCase() === key) return true;
  if (/^[a-z]$/.test(key) && e.code === `Key${key.toUpperCase()}`) return true;
  if (/^[0-9]$/.test(key) && (e.code === `Digit${key}` || e.code === `Numpad${key}`)) return true;
  return false;
}

/** Whether a shortcut may fire while the user types in a field (Ctrl/Alt/Meta or F1–F12). */
export function worksWhileTyping(shortcut: string): boolean {
  const parts = partsOf(shortcut);
  const key = parts[parts.length - 1] ?? '';
  return parts.includes('ctrl') || parts.includes('alt') || parts.includes('meta') || /^f([1-9]|1[0-2])$/.test(key);
}

export type ShortcutScope = 'screen' | 'app';

export interface ShortcutEntry {
  shortcut: string;
  scope: ShortcutScope;
  run: () => void;
}

/** The shortcuts on screen for ONE app (each hub session owns one). */
export class KeyShortcutRegistry {
  private entries: { entry: ShortcutEntry; seq: number }[] = [];
  private seq = 0;

  /** Registers shortcuts; returns the function that removes them again. */
  register(...entries: ShortcutEntry[]): () => void {
    const added = entries.filter((e) => !!e.shortcut?.trim()).map((entry) => ({ entry, seq: ++this.seq }));
    this.entries.push(...added);
    return () => {
      this.entries = this.entries.filter((e) => !added.includes(e));
    };
  }

  /** The entry a keystroke presses: the latest screen entry, else the latest app entry. */
  find(e: KeyLike, typing: boolean): ShortcutEntry | undefined {
    const hits = this.entries
      .filter(({ entry }) => (!typing || worksWhileTyping(entry.shortcut)) && shortcutMatches(entry.shortcut, e))
      .sort((a, b) => (a.entry.scope === b.entry.scope ? b.seq - a.seq : a.entry.scope === 'screen' ? -1 : 1));
    return hits[0]?.entry;
  }

  /** Runs what the keystroke presses; true when something took it (the caller prevents the default). */
  handle(e: KeyLike, typing: boolean): boolean {
    const hit = this.find(e, typing);
    if (!hit) return false;
    hit.run();
    return true;
  }

  /** How many shortcuts are registered (tests, diagnostics). */
  size(): number {
    return this.entries.length;
  }
}

/** The process-wide registry: the single-backend app's. */
export const sharedKeyShortcuts = new KeyShortcutRegistry();

/** The `@Action(shortcut)`s of a component's actions: [actionId, shortcut] pairs. */
export function actionShortcutsOf(actions: unknown): { actionId: string; shortcut: string }[] {
  if (!Array.isArray(actions)) return [];
  return actions
    .map((a) => a as Record<string, unknown>)
    .filter((a) => typeof a?.['id'] === 'string' && typeof a['shortcut'] === 'string' && (a['shortcut'] as string).trim() !== '')
    .map((a) => ({ actionId: a['id'] as string, shortcut: a['shortcut'] as string }));
}

/** Whether the focused DOM element is something the user types into (react-native-web). */
export function isTypingElement(el: { tagName?: string; type?: string; isContentEditable?: boolean } | null | undefined): boolean {
  if (!el) return false;
  const tag = (el.tagName ?? '').toLowerCase();
  if (tag === 'textarea' || tag === 'select') return true;
  if (tag === 'input') return !['checkbox', 'radio', 'button', 'submit', 'reset', 'range', 'color', 'file'].includes((el.type ?? 'text').toLowerCase());
  return el.isContentEditable === true;
}
