package io.mateu.uidl.interfaces;

/**
 * i18n hook for translating UI text. Implement {@link #translate(String, HttpRequest)} to localize
 * the given {@code text} (typically per the request's locale/user); Mateu uses {@code
 * DefaultTranslator} when none is provided.
 */
public interface Translator {

  String translate(String text, HttpRequest httpRequest);

  /**
   * The language the UI is in for this request, as a BCP 47 tag ({@code "es"}, {@code "en-GB"}), or
   * null to let the browser decide. The web client sets it on {@code <html lang>} and draws its own
   * chrome (buttons, empty states, the filter bar…) in it, so a translator that picks the language
   * from a user preference makes the whole page follow it.
   */
  default String locale(HttpRequest httpRequest) {
    return null;
  }
}
