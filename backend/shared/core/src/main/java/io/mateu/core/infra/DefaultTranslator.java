package io.mateu.core.infra;

import io.mateu.core.application.i18n.TranslationRegistry;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Translator;
import jakarta.inject.Named;
import jakarta.inject.Singleton;
import java.util.Locale;
import java.util.MissingResourceException;
import java.util.ResourceBundle;

/**
 * The translator used when the app provides none. Two catalogues, in order: the app's translation
 * files ({@code type: Translations} / {@code specs/ui/translations/<locale>.yaml}, via {@link
 * TranslationRegistry}) — {@code ${i18n.key}} expressions inside the text, or the whole text when
 * it IS a key there — and then a {@code messages} {@link ResourceBundle}, as before.
 */
@Named
@Singleton
public class DefaultTranslator implements Translator {

  private final TranslationRegistry translations;

  @jakarta.inject.Inject
  public DefaultTranslator(TranslationRegistry translations) {
    this.translations = translations;
  }

  public DefaultTranslator() {
    this(new TranslationRegistry());
  }

  @Override
  public String translate(String text, HttpRequest httpRequest) {
    if (text == null || text.isBlank()) return text;
    if (TranslationRegistry.isRaw(httpRequest)) return text;
    var tag = locale(httpRequest);
    if (text.contains("i18n.")) {
      text = translations.interpolate(text, tag);
    }
    if (translations.hasTranslations()) {
      var asKey = translations.message(text, tag);
      if (asKey != null) {
        return asKey;
      }
    }
    Locale locale = resolveLocale(httpRequest);
    try {
      ResourceBundle bundle = ResourceBundle.getBundle("messages", locale);
      if (bundle.containsKey(text)) {
        return bundle.getString(text);
      }
    } catch (MissingResourceException ignored) {
    }
    return text;
  }

  /** The request's first {@code Accept-Language} tag, or null when it sends none. */
  @Override
  public String locale(HttpRequest httpRequest) {
    if (httpRequest == null) return null;
    String acceptLanguage = httpRequest.getHeaderValue("Accept-Language");
    if (acceptLanguage == null || acceptLanguage.isBlank()) return null;
    String tag = acceptLanguage.split(",")[0].trim().split(";")[0].trim();
    if (tag.isEmpty() || "*".equals(tag)) return null;
    return Locale.forLanguageTag(tag).toLanguageTag();
  }

  private Locale resolveLocale(HttpRequest httpRequest) {
    if (httpRequest == null) return Locale.getDefault();
    String acceptLanguage = httpRequest.getHeaderValue("Accept-Language");
    if (acceptLanguage == null || acceptLanguage.isBlank()) return Locale.getDefault();
    try {
      String tag = acceptLanguage.split(",")[0].trim().split(";")[0].trim();
      return Locale.forLanguageTag(tag);
    } catch (Exception e) {
      return Locale.getDefault();
    }
  }
}
