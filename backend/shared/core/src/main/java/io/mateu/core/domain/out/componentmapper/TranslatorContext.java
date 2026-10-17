package io.mateu.core.domain.out.componentmapper;

import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Translator;

public final class TranslatorContext {

  private static final ThreadLocal<Translator> TRANSLATOR = new ThreadLocal<>();
  private static final ThreadLocal<HttpRequest> REQUEST = new ThreadLocal<>();

  public static void set(Translator translator, HttpRequest httpRequest) {
    TRANSLATOR.set(translator);
    REQUEST.set(httpRequest);
  }

  public static void clear() {
    TRANSLATOR.remove();
    REQUEST.remove();
  }

  /** The request being mapped, or null outside a mapping. */
  public static HttpRequest request() {
    return REQUEST.get();
  }

  /** Whether a mapping (or a check acting like one) has set the context on this thread. */
  public static boolean isSet() {
    return TRANSLATOR.get() != null;
  }

  /**
   * Runs {@code work} with the app's translator and {@code httpRequest} as the context — what a
   * mapping has, and an action (a server-side check, a refusal) runs outside of. A context already
   * set is kept.
   */
  public static <T> T within(HttpRequest httpRequest, java.util.function.Supplier<T> work) {
    if (isSet()) {
      return work.get();
    }
    Translator translator = null;
    try {
      translator = io.mateu.uidl.di.MateuBeanProvider.getSingletonBean(Translator.class);
    } catch (RuntimeException noTranslator) {
      // untranslated, then
    }
    if (translator == null) {
      return work.get();
    }
    set(translator, httpRequest);
    try {
      return work.get();
    } finally {
      clear();
    }
  }

  public static String translate(String text) {
    if (text == null) return null;
    Translator t = TRANSLATOR.get();
    HttpRequest r = REQUEST.get();
    if (t == null) return text;
    return t.translate(text, r);
  }
}
