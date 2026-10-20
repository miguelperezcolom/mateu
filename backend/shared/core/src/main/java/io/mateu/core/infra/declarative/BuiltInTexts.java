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
    if (translator == null) {
      return TranslatorContext.translate(text);
    }
    try {
      // with no request at all the app's translator still gets the text (its default language)
      return translator.translate(text, httpRequest);
    } catch (RuntimeException translatorNeedsTheRequest) {
      return text;
    }
  }
}
