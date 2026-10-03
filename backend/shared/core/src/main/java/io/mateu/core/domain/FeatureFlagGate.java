package io.mateu.core.domain;

import io.mateu.uidl.di.MateuBeanProvider;
import io.mateu.uidl.interfaces.FeatureFlags;
import io.mateu.uidl.interfaces.HttpRequest;
import lombok.extern.slf4j.Slf4j;

/**
 * Evaluates a {@code show} condition — a feature-flag name, optionally negated with {@code !} —
 * against the {@link FeatureFlags} beans. Blank means shown. A flag no bean knows is ON, so a
 * condition never hides anything in an app that does not answer it.
 *
 * <p>The simple boolean hook the plan's P4 (expressions, {@code @EnabledIf}, flags in the manifest)
 * will build on: the condition then becomes an expression and the lookups keep landing here.
 */
@Slf4j
public final class FeatureFlagGate {

  private FeatureFlagGate() {}

  public static boolean shows(String condition, HttpRequest httpRequest) {
    if (condition == null || condition.isBlank()) {
      return true;
    }
    var trimmed = condition.trim();
    var negated = trimmed.startsWith("!");
    var flag = negated ? trimmed.substring(1).trim() : trimmed;
    var on = isOn(flag, httpRequest);
    return negated != on;
  }

  static boolean isOn(String flag, HttpRequest httpRequest) {
    try {
      var suppliers = MateuBeanProvider.getBeans(FeatureFlags.class);
      if (suppliers != null) {
        for (var supplier : suppliers) {
          var answer = supplier.isEnabled(flag, httpRequest);
          if (answer != null) {
            return answer;
          }
        }
      }
    } catch (Throwable t) {
      log.debug("feature flag {}: no supplier ({})", flag, t.toString());
    }
    return true;
  }
}
