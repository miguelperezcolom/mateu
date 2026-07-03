package io.mateu.uidl.interfaces;

/**
 * i18n hook for translating UI text. Implement {@link #translate(String, HttpRequest)} to localize
 * the given {@code text} (typically per the request's locale/user); Mateu uses {@code
 * DefaultTranslator} when none is provided.
 */
public interface Translator {

  String translate(String text, HttpRequest httpRequest);
}
