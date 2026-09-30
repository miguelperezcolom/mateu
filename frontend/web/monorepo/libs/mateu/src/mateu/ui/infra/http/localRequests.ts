/**
 * Requests made BY a component for itself, which already shows its own loading state — never the
 * page's busy indicator.
 *
 * A remote combo searching its options spins its own overlay; raising the page veil (or Redwood's
 * busy bar) on top meant two spinners for one keystroke, and a whole screen dimmed while the user
 * only typed in one field. The page indicator is for what the USER started — an action, a
 * navigation — and keeps its delay for those.
 *
 * Local by id, the conventions the backend uses for them (FieldActionCollector):
 *  - `search-<field>` — a lookup's option search (combo, multi-combo, filter lookups), including the
 *    empty search that fills a select, and the type-ahead as the user types;
 *  - `code-<field>` — resolving the label of a code typed into a searchable field;
 *  - `__restfetch__` — a field's `@RestOptions` fetched through the server.
 *
 * Header widgets, the inbox badge and triggered polls already travel as `background`, and the
 * chat talks to the agent outside this transport — they never raised it either.
 */
export const isLocalRequest = (actionId: string | undefined): boolean =>
    !!actionId && (actionId.startsWith('search-') || actionId.startsWith('code-') || actionId === '__restfetch__')
