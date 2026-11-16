package io.mateu.core.infra;

import java.util.Locale;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import lombok.extern.slf4j.Slf4j;

/**
 * The app's pinned UI language: setting {@code mateu.locale} (env {@code MATEU_LOCALE}), a BCP 47
 * tag such as {@code es} or {@code pt-BR}. When it is set, Mateu's own texts and the UI language
 * ({@code AppDto.locale}, so {@code <html lang>}, the client chrome and money formatting) use it
 * for every request instead of the browser's {@code Accept-Language}. An app's own {@code
 * Translator.locale(...)} answer still wins over it.
 *
 * <p>An invalid value is ignored, with one WARN per distinct value.
 */
@Slf4j
public final class ConfiguredLocale {

  public static final String PROPERTY = "mateu.locale";

  private static final Set<String> WARNED = ConcurrentHashMap.newKeySet();

  private ConfiguredLocale() {}

  /** The configured tag, normalised ({@code pt_br} → {@code pt-BR}), or null when not set. */
  public static String tag() {
    return normalize(MateuSettings.get(PROPERTY));
  }

  private static final java.util.regex.Pattern HTML_LANG =
      java.util.regex.Pattern.compile("(<html\\b[^>]*?\\blang=\")[^\"]*(\")");

  /**
   * The served page with its {@code <html lang>} set to the configured language — unchanged when
   * nothing is configured (the client sets it from {@code AppDto.locale} once the app loads).
   */
  public static String htmlLang(String html) {
    var tag = tag();
    if (tag == null || html == null) {
      return html;
    }
    var matcher = HTML_LANG.matcher(html);
    return matcher.find()
        ? matcher.replaceFirst("$1" + java.util.regex.Matcher.quoteReplacement(tag) + "$2")
        : html;
  }

  /** {@code raw} as a BCP 47 tag, or null when blank or not a language. */
  static String normalize(String raw) {
    if (raw == null || raw.isBlank()) {
      return null;
    }
    var value = raw.trim();
    var locale = Locale.forLanguageTag(value.replace('_', '-'));
    var language = locale.getLanguage();
    if (language.isEmpty() || "und".equals(language) || !language.matches("[a-z]{2,8}")) {
      if (WARNED.size() < 100 && WARNED.add(value)) {
        log.warn(
            "Ignoring {}={}: not a language tag (expected e.g. es, en-GB, pt-BR)", PROPERTY, value);
      }
      return null;
    }
    return locale.toLanguageTag();
  }
}
