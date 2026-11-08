# auto-save

**Pins:** a class-level `@AutoSave(debounceMillis = 500, action = "persist")` (.NET
`[AutoSave(500, "persist")]`, Python `@auto_save(debounce_millis=500, action="persist")`): the form
carries an `AutoSave` trigger naming the action and the debounce, and the component advertises
the `*` catch-all (Java's `ActionMapper` adds it for an `@AutoSave` class: the debounced save may
name any action) next to the action itself.

Worth pinning because the ports used to emit `AutoSave` only from their archetypes
(CollectionDetail, GeneralOverview…): a settings screen that saves on every change could not be
declared there.
