package io.mateu.core.domain.out.componentmapper;

import io.mateu.core.infra.MateuSettings;

/**
 * The two global inference switches, one naming scheme for both:
 *
 * <ul>
 *   <li>{@value #LAYOUT} — layout inference ({@code @AutoLayout}) for every class; default {@code
 *       false};
 *   <li>{@value #PAGE} — page-level inference ({@code @AutoPage}) for every class; default {@code
 *       true}.
 * </ul>
 *
 * <p>Each is read as a JVM system property, else the equivalent environment variable ({@link
 * MateuSettings}). An annotation on the class always wins over the switch. The pre-3.0 names
 * ({@code mateu.layout.inference}, {@code mateu.page.inference.disabled}) were removed in 3.0.0.
 */
public final class InferenceSwitches {

  public static final String LAYOUT = "mateu.layout.inference.enabled";
  public static final String PAGE = "mateu.page.inference.enabled";

  /** Whether layout inference is on globally (classes without {@code @AutoLayout}). */
  public static boolean layoutInferenceEnabled() {
    var value = MateuSettings.get(LAYOUT);
    return value != null && Boolean.parseBoolean(value);
  }

  /** Whether page-level inference is on globally (classes without {@code @AutoPage}). */
  public static boolean pageInferenceEnabled() {
    var value = MateuSettings.get(PAGE);
    return value == null || Boolean.parseBoolean(value);
  }

  private InferenceSwitches() {}
}
