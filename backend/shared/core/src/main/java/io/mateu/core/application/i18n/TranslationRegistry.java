package io.mateu.core.application.i18n;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fasterxml.jackson.databind.node.TextNode;
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory;
import io.mateu.core.application.runaction.MountRegistry;
import io.mateu.uidl.data.Translations;
import io.mateu.uidl.di.MateuBeanProvider;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.TranslationsSupplier;
import io.mateu.uidl.interfaces.Translator;
import jakarta.inject.Named;
import jakarta.inject.Singleton;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import lombok.extern.slf4j.Slf4j;

/**
 * The app's translation catalogue — every locale's messages, so a YAML-only app can be multilingual
 * and a Java app can share the same files.
 *
 * <p>Two producers, one catalogue, exactly like the route registry and the REST source catalogue:
 * {@link TranslationsSupplier} beans are the CODE half, the {@code type: Translations} files under
 * {@code specs/ui/} (and the {@code specs/ui/translations/<locale>.yaml} convention) the AUTHORED
 * half, merged on top key by key — <b>authored wins</b>.
 *
 * <p>Texts reference a message as {@code ${i18n.orders.title}} — the {@code i18n} scope of the
 * {@code ${…}} expressions the renderers already interpolate ({@code state}, {@code data}…). It is
 * resolved on the SERVER, per request, for the request's locale ({@link #localeOf}): the wire
 * carries finished text, so every renderer (web, Redwood, React Native, IntelliJ) shows it with no
 * work of its own. With no server (a static bundle, the visual editor's Play) the catalogue travels
 * in the manifest and the browser resolves the same expressions.
 *
 * <p>Lookup order for a key: the exact locale ({@code es-ES}), its language ({@code es}), the
 * fallback locale ({@code -Dmateu.i18n.fallback} / {@code MATEU_I18N_FALLBACK}, default {@code
 * en}), then the key itself — with ONE warning per (locale, key), so a missing translation is
 * visible without flooding the log.
 */
@Slf4j
@Named
@Singleton
public class TranslationRegistry {

  /** The {@code ${i18n.key}} expression, anywhere inside a text. */
  public static final Pattern EXPRESSION =
      Pattern.compile("\\$\\{\\s*i18n\\.([A-Za-z0-9_][A-Za-z0-9_.\\-]*)\\s*}");

  /**
   * A request attribute: when {@code true}, {@code ${i18n.…}} expressions are left as written. The
   * bundle exporter sets it so a pre-rendered screen keeps them, and the browser resolves them for
   * the visitor's locale from the catalogue shipped in the manifest.
   */
  public static final String RAW_ATTRIBUTE = "mateu.i18n.raw";

  static final String CONVENTIONAL_DIR = "specs/ui/translations/";

  private final ObjectMapper yaml = new ObjectMapper(new YAMLFactory());
  private final Set<String> warned = ConcurrentHashMap.newKeySet();
  private volatile Map<String, Map<String, String>> catalogue;

  /** locale (lower-case BCP 47) → key → text, loaded once. */
  public Map<String, Map<String, String>> catalogue() {
    var loaded = catalogue;
    if (loaded == null) {
      synchronized (this) {
        loaded = catalogue;
        if (loaded == null) {
          loaded = load(classLoader());
          catalogue = loaded;
        }
      }
    }
    return loaded;
  }

  /** Whether any translation is declared at all. */
  public boolean hasTranslations() {
    return !catalogue().isEmpty();
  }

  Map<String, Map<String, String>> load(ClassLoader classLoader) {
    var merged = new TreeMap<String, Map<String, String>>();
    for (var translations : fromSupplierBeans()) {
      add(merged, translations.locale(), flatten(translations.messages()));
    }
    for (var translations : authoredFrom(classLoader)) {
      add(merged, translations.locale(), flatten(translations.messages()));
    }
    if (!merged.isEmpty()) {
      log.info(
          "Translations: {} locale(s) {} (fallback '{}')",
          merged.size(),
          merged.keySet(),
          fallbackLocale());
    }
    var frozen = new LinkedHashMap<String, Map<String, String>>();
    merged.forEach((locale, messages) -> frozen.put(locale, Map.copyOf(messages)));
    return Map.copyOf(frozen);
  }

  private static void add(
      Map<String, Map<String, String>> into, String locale, Map<String, String> messages) {
    var key = normalize(locale);
    if (key.isEmpty()) {
      return;
    }
    into.computeIfAbsent(key, k -> new LinkedHashMap<>()).putAll(messages);
  }

  private List<Translations> fromSupplierBeans() {
    try {
      var beans = MateuBeanProvider.getBeans(TranslationsSupplier.class);
      if (beans == null) {
        return List.of();
      }
      var out = new ArrayList<Translations>();
      for (var bean : beans) {
        var contributed = bean.translations();
        if (contributed != null) {
          contributed.stream().filter(t -> t != null).forEach(out::add);
        }
      }
      return out;
    } catch (Throwable t) {
      log.debug("Translations: no supplier beans available ({})", t.toString());
      return List.of();
    }
  }

  /**
   * The authored half: every {@code type: Translations} file under {@code specs/ui/}, plus the
   * files under {@code specs/ui/translations/} (the locale is then the file name when the file does
   * not say).
   */
  public List<Translations> authoredFrom(ClassLoader classLoader) {
    var cl = classLoader == null ? TranslationRegistry.class.getClassLoader() : classLoader;
    var found = new ArrayList<Translations>();
    for (var path : MountRegistry.yamlResourcePaths(cl)) {
      try (InputStream is = cl.getResourceAsStream(path)) {
        if (is == null) {
          continue;
        }
        var root = yaml.readTree(is);
        var translations = parse(root, path);
        if (translations != null) {
          found.add(translations);
        }
      } catch (Exception e) {
        log.warn("Failed to read translations {}: {}", path, e.getMessage());
      }
    }
    return found;
  }

  /** A parsed file as one locale's catalogue, or null when it is not a translations file. */
  public static Translations parse(JsonNode root, String path) {
    if (root == null || !root.isObject()) {
      return null;
    }
    var type = root.path("type").asText("");
    var conventional = path != null && path.startsWith(CONVENTIONAL_DIR);
    if (!"Translations".equals(type) && !(conventional && type.isEmpty())) {
      return null;
    }
    var locale = root.path("locale").asText("");
    if (locale.isBlank() && path != null) {
      var name = path.substring(path.lastIndexOf('/') + 1);
      locale = name.replaceFirst("\\.ya?ml$", "");
    }
    if (locale.isBlank()) {
      log.warn("Ignoring translations {} with no locale", path);
      return null;
    }
    var messages = root.get("messages");
    var map = new LinkedHashMap<String, Object>();
    if (messages != null && messages.isObject()) {
      flattenInto("", messages, map);
    }
    return new Translations(locale, map);
  }

  private static void flattenInto(String prefix, JsonNode node, Map<String, Object> out) {
    node.fields()
        .forEachRemaining(
            entry -> {
              var key = prefix.isEmpty() ? entry.getKey() : prefix + "." + entry.getKey();
              if (entry.getValue().isObject()) {
                flattenInto(key, entry.getValue(), out);
              } else if (!entry.getValue().isNull()) {
                out.put(key, entry.getValue().asText());
              }
            });
  }

  /** Nested maps flattened with dots (a code supplier may hand either shape). */
  static Map<String, String> flatten(Map<String, Object> messages) {
    var out = new LinkedHashMap<String, String>();
    flatten("", messages, out);
    return out;
  }

  @SuppressWarnings("unchecked")
  private static void flatten(
      String prefix, Map<String, Object> messages, Map<String, String> out) {
    if (messages == null) {
      return;
    }
    messages.forEach(
        (key, value) -> {
          var full = prefix.isEmpty() ? key : prefix + "." + key;
          if (value instanceof Map<?, ?> nested) {
            flatten(full, (Map<String, Object>) nested, out);
          } else if (value != null) {
            out.put(full, String.valueOf(value));
          }
        });
  }

  /**
   * The text of {@code key} for {@code locale}, falling back to the language, then to the fallback
   * locale; null when no catalogue has it.
   */
  public String message(String key, String locale) {
    var all = catalogue();
    for (var candidate : candidates(locale)) {
      var messages = all.get(candidate);
      if (messages != null && messages.containsKey(key)) {
        return messages.get(key);
      }
    }
    return null;
  }

  /** The locales tried for a request locale, most specific first, de-duplicated. */
  static List<String> candidates(String locale) {
    var out = new ArrayList<String>();
    var normalized = normalize(locale);
    if (!normalized.isEmpty()) {
      out.add(normalized);
      var dash = normalized.indexOf('-');
      if (dash > 0) {
        out.add(normalized.substring(0, dash));
      }
    }
    var fallback = normalize(fallbackLocale());
    if (!fallback.isEmpty() && !out.contains(fallback)) {
      out.add(fallback);
      var dash = fallback.indexOf('-');
      if (dash > 0 && !out.contains(fallback.substring(0, dash))) {
        out.add(fallback.substring(0, dash));
      }
    }
    return out;
  }

  /** {@code ${i18n.key}} expressions in {@code text} resolved for {@code locale}. */
  public String interpolate(String text, String locale) {
    if (text == null || !text.contains("i18n.")) {
      return text;
    }
    Matcher matcher = EXPRESSION.matcher(text);
    var out = new StringBuilder();
    while (matcher.find()) {
      var key = matcher.group(1);
      var resolved = message(key, locale);
      if (resolved == null) {
        if (warned.add(normalize(locale) + "#" + key)) {
          log.warn("Missing translation '{}' for locale '{}' — showing the key", key, locale);
        }
        resolved = key;
      }
      matcher.appendReplacement(out, Matcher.quoteReplacement(resolved));
    }
    matcher.appendTail(out);
    return out.toString();
  }

  /** Whether {@code node} mentions an {@code ${i18n.…}} expression anywhere. */
  public static boolean mentionsI18n(JsonNode node) {
    if (node == null) {
      return false;
    }
    if (node.isTextual()) {
      return EXPRESSION.matcher(node.asText()).find();
    }
    for (var it = node.elements(); it.hasNext(); ) {
      if (mentionsI18n(it.next())) {
        return true;
      }
    }
    return false;
  }

  /** {@code node} (mutated in place) with every {@code ${i18n.…}} resolved for {@code locale}. */
  public JsonNode translateTree(JsonNode node, String locale) {
    if (node instanceof ObjectNode object) {
      var names = new ArrayList<String>();
      object.fieldNames().forEachRemaining(names::add);
      for (var name : names) {
        var child = object.get(name);
        if (child.isTextual()) {
          object.set(name, TextNode.valueOf(interpolate(child.asText(), locale)));
        } else {
          translateTree(child, locale);
        }
      }
    } else if (node instanceof ArrayNode array) {
      for (int i = 0; i < array.size(); i++) {
        var child = array.get(i);
        if (child.isTextual()) {
          array.set(i, TextNode.valueOf(interpolate(child.asText(), locale)));
        } else {
          translateTree(child, locale);
        }
      }
    }
    return node;
  }

  /** Whether the request asks to keep the expressions (a bundle export). */
  public static boolean isRaw(HttpRequest httpRequest) {
    try {
      return httpRequest != null && Boolean.TRUE.equals(httpRequest.getAttribute(RAW_ATTRIBUTE));
    } catch (RuntimeException e) {
      return false;
    }
  }

  /**
   * The UI language of a request: what the app's {@link Translator} says (by default the first
   * {@code Accept-Language} tag), else the header read directly; null when neither says.
   */
  public static String localeOf(HttpRequest httpRequest) {
    try {
      var translator = MateuBeanProvider.getBean(Translator.class);
      if (translator != null) {
        var locale = translator.locale(httpRequest);
        if (locale != null && !locale.isBlank()) {
          return locale;
        }
      }
    } catch (Throwable ignored) {
      // no bean context (a build-time export, a bare test): read the header ourselves
    }
    return acceptLanguage(httpRequest);
  }

  /** The request's first {@code Accept-Language} tag, or null. */
  public static String acceptLanguage(HttpRequest httpRequest) {
    if (httpRequest == null) {
      return null;
    }
    try {
      var header = httpRequest.getHeaderValue("Accept-Language");
      if (header == null || header.isBlank()) {
        return null;
      }
      var tag = header.split(",")[0].trim().split(";")[0].trim();
      return tag.isEmpty() || "*".equals(tag) ? null : Locale.forLanguageTag(tag).toLanguageTag();
    } catch (RuntimeException e) {
      return null;
    }
  }

  /** The locale used when the request's has no catalogue or lacks a key. */
  public static String fallbackLocale() {
    var configured = System.getProperty("mateu.i18n.fallback");
    if (configured == null || configured.isBlank()) {
      configured = System.getenv("MATEU_I18N_FALLBACK");
    }
    return configured == null || configured.isBlank() ? "en" : configured.trim();
  }

  static String normalize(String locale) {
    return locale == null ? "" : locale.trim().replace('_', '-').toLowerCase(Locale.ROOT);
  }

  /** For tests: forget the loaded catalogue (and the warnings) so the next call reloads. */
  public void reset() {
    catalogue = null;
    warned.clear();
  }

  private static ClassLoader classLoader() {
    var context = Thread.currentThread().getContextClassLoader();
    return context == null ? TranslationRegistry.class.getClassLoader() : context;
  }
}
