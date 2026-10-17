package io.mateu.core.infra;

import io.mateu.uidl.di.MateuBeanProvider;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Translator;
import java.lang.annotation.Annotation;
import java.util.Locale;
import java.util.MissingResourceException;
import java.util.ResourceBundle;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * The language bean-validation messages are given in: the REQUEST's — what the app's {@link
 * Translator} says, the same language the chrome is drawn in — and English when the request names
 * none, or names one no validation bundle speaks.
 *
 * <p>Never the JVM's default locale. Hibernate Validator's interpolator takes it as its default,
 * and {@link ResourceBundle} falls back to it whenever the asked-for language has no bundle — so a
 * server on a Spanish machine answered English users in Spanish. Every lookup here is done without
 * that fallback.
 */
public final class ValidationLocale {

  private static final String USER_BUNDLE = "ValidationMessages";
  private static final String VALIDATOR_BUNDLE = "org.hibernate.validator.ValidationMessages";
  private static final ResourceBundle.Control NO_FALLBACK =
      ResourceBundle.Control.getNoFallbackControl(ResourceBundle.Control.FORMAT_DEFAULT);
  private static final Pattern TEMPLATE = Pattern.compile("\\{([^{}]+)}");

  private ValidationLocale() {}

  /** The request's language, or English. */
  public static Locale of(HttpRequest httpRequest) {
    String tag = null;
    try {
      var translator = MateuBeanProvider.getSingletonBean(Translator.class);
      tag = translator != null ? translator.locale(httpRequest) : null;
    } catch (RuntimeException noTranslator) {
      // no translator: nothing names a language
    }
    if (tag == null || tag.isBlank()) {
      return Locale.ENGLISH;
    }
    var locale = Locale.forLanguageTag(tag.trim());
    if (locale.getLanguage().isEmpty()) {
      return Locale.ENGLISH;
    }
    return speaks(VALIDATOR_BUNDLE, locale) || speaks(USER_BUNDLE, locale)
        ? locale
        : Locale.ENGLISH;
  }

  private static boolean speaks(String bundle, Locale locale) {
    var found = bundle(bundle, locale);
    return found != null && !found.getLocale().getLanguage().isEmpty();
  }

  private static ResourceBundle bundle(String name, Locale locale) {
    try {
      var context = Thread.currentThread().getContextClassLoader();
      return ResourceBundle.getBundle(
          name,
          locale,
          context != null ? context : ValidationLocale.class.getClassLoader(),
          NO_FALLBACK);
    } catch (MissingResourceException none) {
      return null;
    }
  }

  /**
   * A constraint's message with its {@code {key}} templates resolved the way the validator would —
   * the app's {@code ValidationMessages} bundle in {@code locale} (never the JVM's), then the
   * annotation's own attributes ({@code {min}}, {@code {max}}, {@code {value}}…). A key nothing
   * resolves stays as written.
   */
  public static String resolve(String message, Annotation annotation, Locale locale) {
    if (message == null || !message.contains("{")) {
      return message;
    }
    var user = bundle(USER_BUNDLE, locale);
    var resolved = substitute(message, key -> lookup(user, key));
    return substitute(resolved, key -> attribute(annotation, key));
  }

  private static String lookup(ResourceBundle bundle, String key) {
    if (bundle == null) {
      return null;
    }
    try {
      return bundle.getString(key);
    } catch (MissingResourceException missing) {
      return null;
    }
  }

  private static String attribute(Annotation annotation, String key) {
    if (annotation == null) {
      return null;
    }
    try {
      var value = annotation.annotationType().getMethod(key).invoke(annotation);
      return value == null ? null : String.valueOf(value);
    } catch (ReflectiveOperationException | RuntimeException notAnAttribute) {
      return null;
    }
  }

  private static String substitute(
      String message, java.util.function.Function<String, String> valueOf) {
    Matcher matcher = TEMPLATE.matcher(message);
    var out = new StringBuilder();
    while (matcher.find()) {
      var value = valueOf.apply(matcher.group(1).trim());
      matcher.appendReplacement(
          out, Matcher.quoteReplacement(value != null ? value : matcher.group()));
    }
    matcher.appendTail(out);
    return out.toString();
  }
}
