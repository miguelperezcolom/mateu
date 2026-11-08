package io.mateu.explorer.examples.behaviour.i18n;

import io.mateu.core.application.i18n.TranslationRegistry;
import io.mateu.core.infra.DefaultTranslator;
import io.mateu.uidl.interfaces.HttpRequest;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

/**
 * The request's locale = the "Language" picked on the header, else the browser's
 * {@code Accept-Language} (the default translator's rule). Everything else is the default
 * translator: {@code ${i18n.x}} and catalogue keys.
 *
 * <p>A real app usually needs no translator at all — {@code Accept-Language} is the default — or
 * takes the language from the user's profile here.
 */
@Primary
@Component
public class DemoLanguageTranslator extends DefaultTranslator {

  public DemoLanguageTranslator(TranslationRegistry translations) {
    super(translations);
  }

  @Override
  public String locale(HttpRequest httpRequest) {
    var picked = httpRequest == null ? null : httpRequest.appContext("demoLanguage");
    return picked != null ? picked.toString() : super.locale(httpRequest);
  }
}
