package io.mateu.core.infra;

import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Translator;
import jakarta.inject.Named;
import jakarta.inject.Singleton;
import java.util.Locale;
import java.util.MissingResourceException;
import java.util.ResourceBundle;

@Named
@Singleton
public class DefaultTranslator implements Translator {

  @Override
  public String translate(String text, HttpRequest httpRequest) {
    if (text == null || text.isBlank()) return text;
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
