---
title: "Translations in YAML"
description: "Make a YAML-authored app multilingual with per-locale message files and ${i18n.key} expressions — shared with Java apps."
---

A YAML app keeps its texts in **message catalogues**, one per locale, and its labels, titles and
texts reference them with `${i18n.<key>}`. The same files serve a Java app: the default
`Translator` reads them too.

```yaml
# specs/ui/translations/es.yaml
messages:
  orders:
    title: Pedidos
    new: Nuevo pedido
  common:
    save: Guardar
```

```yaml
# specs/ui/orders.yaml
layout:
  type: VerticalLayout
  content:
    - {type: Text, text: "${i18n.orders.title}"}
    - {type: Button, label: "${i18n.orders.new}", actionId: create}
```

## The files

Two spellings, the same thing:

- **By convention**: `specs/ui/translations/<locale>.yaml`. The file name is the locale; `type:`
  and `locale:` may be omitted.
- **Anywhere under `specs/ui/`**: a file with `type: Translations` and a `locale:`.

```yaml
type: Translations
locale: en-GB
messages:
  orders: {title: Orders, new: New order}
```

`messages` is a free tree: nested maps are flattened with dots, so `orders: {title: …}` is the key
`orders.title`. Locales are BCP 47 tags (`es`, `en-GB`); matching ignores case and accepts `_`.

The catalogue is checked against the generated `specs-schema.json` like every other `specs/ui`
file (the `type: Translations` branch).

## Where `${i18n.…}` works

`i18n` is one more scope of the `${…}` expressions the labels already understand (`state`,
`data`…): use it in any label, title, text or other string a definition or an app shell
carries — menu labels, button labels, field labels, section titles, page titles. An expression can
sit inside a longer text: `"${i18n.orders.title} (${state.count})"` — the `i18n` part is resolved
first and the rest is left to the client.

## Which language

The request's locale is what the app's `Translator.locale(HttpRequest)` answers — by default the
first tag of the `Accept-Language` header. It is also what the client gets as `AppDto.locale`, so
the renderer's own chrome follows the same language.

For each key the catalogue is searched in this order:

1. the exact locale (`es-ES`);
2. its language (`es`);
3. the **fallback locale** — `-Dmateu.i18n.fallback` or `MATEU_I18N_FALLBACK`, default `en`;
4. the **key itself** (`orders.title`), with **one warning** in the log per locale and key —
   visible without flooding the log.

## Resolved on the server

With a backend, `${i18n.…}` is resolved **on the server, per request**: the wire carries finished
text, so every renderer — web, Redwood, React Native, IntelliJ — shows it with no work of its own.
A definition that mentions `${i18n.…}` is re-derived for each request's locale; one that does not
is shared as before.

## Translations in code

A `TranslationsSupplier` bean is the code producer of the same catalogue, exactly as a
`RestSourceCatalogSupplier` is for `sources.yaml`:

```java
@Component
class Messages implements TranslationsSupplier {
  public List<Translations> translations() {
    return List.of(new Translations("es", Map.of("orders", Map.of("title", "Pedidos"))));
  }
}
```

The two halves merge key by key, and **the YAML files win**: a key a file also declares takes the
file's text.

### Java labels use the same files

The default `Translator` (`DefaultTranslator`, used when the app provides none) consults the
catalogue first:

- `${i18n.key}` inside any text it translates — `@Label("${i18n.orders.title}")` works;
- a text that **is** a key of the catalogue — `@Label("orders.title")` is translated;
- then the classic `messages` `ResourceBundle`, as before.

## Static bundles and Play

With no server nobody resolves the expressions on the way out, so the browser does:

- The catalogue travels in the bundle's `manifest.json` (`translations`: locale → key → text).
- Pre-rendered screens **keep** their `${i18n.…}` expressions on purpose — a bundle serves every
  visitor — and raw definitions (`specsOnly`) are expanded with them too.
- The browser resolves them for `AppDto.locale` when the app sets one, else for the browser's
  language (`navigator.language`), with the same fallback chain.
- In the visual editor, **▶ Play** reads the project's translation files and offers a locale
  switcher, so you can click through the app in every language you have.

## See also

- [Internationalization](/java-user-manual/advanced/i18n/) — `Translator` and the code side.
- [Permissions in YAML](/java-ui-definition/yaml-security/) and [Environments](/java-ui-definition/environments/).
