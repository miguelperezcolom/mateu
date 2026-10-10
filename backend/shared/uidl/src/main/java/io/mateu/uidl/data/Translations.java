package io.mateu.uidl.data;

import java.util.Map;

/**
 * One locale's message catalogue — the data a YAML app (or a code {@code TranslationsSupplier})
 * translates its labels with.
 *
 * <p>Authored as a {@code type: Translations} file anywhere under {@code specs/ui/}, or by
 * convention as {@code specs/ui/translations/<locale>.yaml} (where the file name is the locale and
 * {@code type:} may be omitted):
 *
 * <pre>
 * type: Translations
 * locale: es
 * messages:
 *   orders:
 *     title: Pedidos
 *     new: Nuevo pedido
 * </pre>
 *
 * Nested maps are flattened with dots, so a label says {@code ${i18n.orders.title}}. The {@code
 * i18n} scope is resolved for the request's locale (the app's {@code Translator.locale}, by default
 * the first {@code Accept-Language} tag), falling back from {@code es-ES} to {@code es} to the
 * fallback locale, and finally to the key itself — with one WARN per missing key.
 *
 * @param locale a BCP 47 tag ({@code es}, {@code en-GB})
 * @param messages key → text, possibly nested (flattened with dots)
 */
public record Translations(String locale, Map<String, Object> messages) {

  public Translations {
    locale = locale == null ? "" : locale.trim();
    messages = messages == null ? Map.of() : Map.copyOf(messages);
  }
}
