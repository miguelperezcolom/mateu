package io.mateu.core.domain.out.componentmapper;

import io.mateu.core.infra.MateuSettings;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import lombok.extern.slf4j.Slf4j;

/**
 * The two global inference switches, one naming scheme for both (since 3.0-alpha.412):
 *
 * <ul>
 *   <li>{@value #LAYOUT} — layout inference ({@code @AutoLayout}) for every class; default {@code
 *       false};
 *   <li>{@value #PAGE} — page-level inference ({@code @AutoPage}) for every class; default {@code
 *       true}.
 * </ul>
 *
 * <p>Each is read as a JVM system property, else the equivalent environment variable ({@link
 * MateuSettings}). An annotation on the class always wins over the switch. The previous names —
 * {@value #LEGACY_LAYOUT} ({@code true} enables) and {@value #LEGACY_PAGE_DISABLED} ({@code true}
 * disables, the opposite polarity) — keep working as deprecated aliases, with one WARN per JVM
 * naming the replacement; the new name wins when both are set.
 */
@Slf4j
public final class InferenceSwitches {

  public static final String LAYOUT = "mateu.layout.inference.enabled";
  public static final String PAGE = "mateu.page.inference.enabled";

  /** Deprecated alias of {@link #LAYOUT}, same polarity. */
  public static final String LEGACY_LAYOUT = "mateu.layout.inference";

  /** Deprecated alias of {@link #PAGE}, inverted polarity ({@code true} = page inference off). */
  public static final String LEGACY_PAGE_DISABLED = "mateu.page.inference.disabled";

  private static final Set<String> WARNED = ConcurrentHashMap.newKeySet();

  /** Whether layout inference is on globally (classes without {@code @AutoLayout}). */
  public static boolean layoutInferenceEnabled() {
    var value = MateuSettings.get(LAYOUT);
    if (value != null) {
      return Boolean.parseBoolean(value);
    }
    var legacy = MateuSettings.get(LEGACY_LAYOUT);
    if (legacy != null) {
      warnLegacy(LEGACY_LAYOUT, LAYOUT + "=" + legacy);
      return Boolean.parseBoolean(legacy);
    }
    return false;
  }

  /** Whether page-level inference is on globally (classes without {@code @AutoPage}). */
  public static boolean pageInferenceEnabled() {
    var value = MateuSettings.get(PAGE);
    if (value != null) {
      return Boolean.parseBoolean(value);
    }
    var legacy = MateuSettings.get(LEGACY_PAGE_DISABLED);
    if (legacy != null) {
      boolean disabled = Boolean.parseBoolean(legacy);
      warnLegacy(LEGACY_PAGE_DISABLED, PAGE + "=" + !disabled);
      return !disabled;
    }
    return true;
  }

  private static void warnLegacy(String legacyKey, String replacement) {
    if (WARNED.add(legacyKey)) {
      log.warn(
          "The setting '{}' is deprecated (since 3.0-alpha.412) and will be removed: use '{}' "
              + "instead.",
          legacyKey,
          replacement);
    }
  }

  /** For tests: forget which deprecation warnings were already logged. */
  static void resetWarnings() {
    WARNED.clear();
  }

  /** For tests: whether the deprecation warning for that legacy key was logged. */
  static boolean warned(String legacyKey) {
    return WARNED.contains(legacyKey);
  }

  private InferenceSwitches() {}
}
