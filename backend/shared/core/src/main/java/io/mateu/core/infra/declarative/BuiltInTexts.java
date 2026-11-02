package io.mateu.core.infra.declarative;

import io.mateu.core.application.i18n.TranslationRegistry;
import io.mateu.core.domain.out.componentmapper.TranslatorContext;
import io.mateu.uidl.di.MateuBeanProvider;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Translator;
import java.util.Locale;
import java.util.Map;

/**
 * A text Mateu itself writes (a button label, a dialog title), in English, through the app's {@link
 * Translator} bean for this request — the same i18n hook as every other Mateu text — or the
 * mapping's translator context when no bean is reachable.
 *
 * <p>When the app's translator leaves the text as it is, Mateu's OWN words (the built-in buttons: a
 * crud's New / Save / Cancel / Edit / Delete / Back to list…) come out in the UI's language from a
 * small catalogue of their own, like the renderers' chrome texts: the language the translator says
 * ({@link Translator#locale}), else the browser's ({@code Accept-Language}) — the one the client
 * puts on {@code <html lang>} and draws its chrome in. They were English next to the renderer's own
 * Spanish («Save» beside «Cancelar»). A language the catalogue lacks keeps English.
 */
public final class BuiltInTexts {

  private BuiltInTexts() {}

  /**
   * Mateu's own words, by language, keyed by their English text. Kept in step with the renderers'
   * chrome catalogues (libs/mateu chromeTexts.ts, Redwood i18n.mjs).
   */
  static final Map<String, Map<String, String>> CATALOGUE =
      Map.of(
          "es",
          Map.ofEntries(
              // a crud's built-in buttons (Crud.newLabel(), saveLabel()…)
              Map.entry("New", "Nuevo"),
              Map.entry("Save", "Guardar"),
              Map.entry("Save and next", "Guardar y siguiente"),
              Map.entry("Cancel", "Cancelar"),
              Map.entry("Delete", "Eliminar"),
              Map.entry("Edit", "Editar"),
              Map.entry("Add another", "Añadir otro"),
              Map.entry("Back to list", "Volver al listado"),
              Map.entry("Import", "Importar"),
              Map.entry("History", "Historial"),
              // the other built-in buttons that already pass through here
              Map.entry("Save and close", "Guardar y cerrar"),
              Map.entry("Skip", "Omitir"),
              Map.entry("Today", "Hoy"),
              Map.entry("Reload", "Recargar"),
              Map.entry("Overwrite", "Sobrescribir")));

  public static String translate(String text, HttpRequest httpRequest) {
    if (text == null || text.isBlank()) {
      return text;
    }
    if (httpRequest == null) {
      // a text built lazily (a Callable<Component> field the mapping invokes) may not have the
      // request at hand: the request being mapped is the one
      httpRequest = TranslatorContext.request();
    }
    if (httpRequest == null && TranslatorContext.isSet()) {
      return TranslatorContext.translate(text);
    }
    Translator translator = null;
    try {
      translator = MateuBeanProvider.getSingletonBean(Translator.class);
    } catch (RuntimeException ignored) {
      // no bean provider (e.g. a plain unit test): fall back to the translator context
    }
    String translated;
    if (translator == null) {
      translated = TranslatorContext.translate(text);
    } else {
      try {
        // with no request at all the app's translator still gets the text (its default language)
        translated = translator.translate(text, httpRequest);
      } catch (RuntimeException translatorNeedsTheRequest) {
        translated = text;
      }
    }
    if (!text.equals(translated)) {
      return translated;
    }
    return ownWord(text, language(translator, httpRequest));
  }

  /**
   * {@code text} in {@code language} when it is one of Mateu's own words, else {@code text} as it
   * is (an app's label, a language the catalogue lacks, no language at all).
   */
  static String ownWord(String text, String language) {
    if (language == null) {
      return text;
    }
    var words = CATALOGUE.get(language);
    return words == null ? text : words.getOrDefault(text, text);
  }

  /**
   * The UI's language (a lower-case primary subtag) for this request: the translator's, else the
   * browser's first {@code Accept-Language}; null with no request, or for a static bundle's raw
   * render (the visitor's browser picks the language there).
   */
  static String language(Translator translator, HttpRequest httpRequest) {
    if (httpRequest == null || TranslationRegistry.isRaw(httpRequest)) {
      return null;
    }
    String tag = null;
    if (translator != null) {
      try {
        tag = translator.locale(httpRequest);
      } catch (RuntimeException ignored) {
        // a translator that cannot tell: the browser's, then
      }
    }
    if (tag == null || tag.isBlank()) {
      try {
        var acceptLanguage = httpRequest.getHeaderValue("Accept-Language");
        if (acceptLanguage != null) {
          tag = acceptLanguage.split(",")[0].split(";")[0].trim();
        }
      } catch (RuntimeException ignored) {
        // no headers (a synthetic request)
      }
    }
    if (tag == null || tag.isBlank() || "*".equals(tag)) {
      return null;
    }
    return Locale.forLanguageTag(tag.replace('_', '-')).getLanguage().toLowerCase(Locale.ROOT);
  }
}
