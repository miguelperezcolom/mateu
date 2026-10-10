/**
 * Card menus: a menu GROUP carrying `display: "cards"` shows its entries as cards instead of rows
 * (like the product dropdowns of a docs site). Each entry is one card — label = title,
 * description = text, icon / image — and tapping it navigates like a plain entry. An entry with
 * its own submenus is NOT navigable itself: its submenus are the card's ACTIONS, each navigating
 * like a plain entry. Pure logic (no react-native import) so it runs under `node --test`.
 */

export interface MenuCardEntry {
  label?: string;
  description?: string | null;
  icon?: string | null;
  image?: string | null;
  separator?: boolean;
  submenus?: MenuCardEntry[];
  display?: string | null;
}

export interface MenuCard<T extends MenuCardEntry> {
  title: string;
  description?: string;
  /** Absolute (or data:) image URI, ready for `<Image source={{ uri }} />`. */
  imageUri?: string;
  /** A glyph that can be shown as text (an emoji); design-system icon names like `vaadin:home` are dropped. */
  glyph?: string;
  /** The entry to navigate to when the card itself is tapped; undefined when it has actions instead. */
  target?: T;
  actions: T[];
}

/** True when this group renders its entries as cards. */
export const isCardsGroup = (item: MenuCardEntry): boolean =>
  item.display === 'cards' && (item.submenus ?? []).length > 0;

/**
 * Resolves an entry image against the backend base: data: / http(s): / protocol-relative URIs are
 * kept, anything else is taken as relative to `baseUrl` (a native app has no document origin).
 */
export const resolveImageUri = (image: string | null | undefined, baseUrl: string): string | undefined => {
  const src = (image ?? '').trim();
  if (!src) return undefined;
  if (/^(data:|https?:|file:|blob:)/i.test(src)) return src;
  if (src.startsWith('//')) return `https:${src}`;
  const base = (baseUrl ?? '').replace(/\/+$/, '');
  return `${base}/${src.replace(/^\/+/, '')}`;
};

/** An icon is only renderable as text when it is not a design-system icon name (`prefix:name`). */
export const iconGlyph = (icon: string | null | undefined): string | undefined => {
  const value = (icon ?? '').trim();
  if (!value || /^[a-z0-9-]+:[a-z0-9-]+$/i.test(value)) return undefined;
  return value.length <= 4 ? value : undefined;
};

/** The cards of a cards group, one per non-separator entry. */
export const cardsOf = <T extends MenuCardEntry>(group: T, baseUrl: string): MenuCard<T>[] =>
  ((group.submenus ?? []) as T[])
    .filter((entry) => !entry.separator)
    .map((entry) => {
      const actions = ((entry.submenus ?? []) as T[]).filter((a) => !a.separator);
      return {
        title: entry.label ?? '',
        description: entry.description?.trim() || undefined,
        imageUri: resolveImageUri(entry.image, baseUrl),
        glyph: iconGlyph(entry.icon),
        target: actions.length > 0 ? undefined : entry,
        actions,
      };
    });
