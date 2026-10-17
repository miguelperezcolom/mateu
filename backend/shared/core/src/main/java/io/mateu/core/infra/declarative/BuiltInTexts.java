package io.mateu.core.infra.declarative;

import io.mateu.core.domain.out.componentmapper.TranslatorContext;
import io.mateu.uidl.di.MateuBeanProvider;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Translator;

/**
 * A text Mateu itself writes (a button label, a dialog title), in English, through the app's {@link
 * Translator} bean for this request — the same i18n hook as every other Mateu text — or the
 * mapping's translator context when no bean is reachable.
 */
public final class BuiltInTexts {

  private BuiltInTexts() {}

  public static String translate(String text, HttpRequest httpRequest) {
    if (text == null || text.isBlank()) {
      return text;
    }
    Translator translator = null;
    if (httpRequest != null) {
      try {
        translator = MateuBeanProvider.getBean(Translator.class);
      } catch (RuntimeException ignored) {
        // no bean provider (e.g. a plain unit test): fall back to the translator context
      }
    }
    return translator != null
        ? translator.translate(text, httpRequest)
        : TranslatorContext.translate(text);
  }
}
