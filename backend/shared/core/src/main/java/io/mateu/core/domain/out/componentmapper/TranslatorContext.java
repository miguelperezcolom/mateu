package io.mateu.core.domain.out.componentmapper;

import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Translator;

final class TranslatorContext {

  private static final ThreadLocal<Translator> TRANSLATOR = new ThreadLocal<>();
  private static final ThreadLocal<HttpRequest> REQUEST = new ThreadLocal<>();

  static void set(Translator translator, HttpRequest httpRequest) {
    TRANSLATOR.set(translator);
    REQUEST.set(httpRequest);
  }

  static void clear() {
    TRANSLATOR.remove();
    REQUEST.remove();
  }

  static String translate(String text) {
    if (text == null) return null;
    Translator t = TRANSLATOR.get();
    HttpRequest r = REQUEST.get();
    if (t == null) return text;
    return t.translate(text, r);
  }
}
