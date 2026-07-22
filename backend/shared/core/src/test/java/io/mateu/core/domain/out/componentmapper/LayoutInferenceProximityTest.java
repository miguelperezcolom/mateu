package io.mateu.core.domain.out.componentmapper;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

/**
 * Inference is deterministic (same class → same layout) but threshold-based, so a class near a
 * threshold can flip layout when a field is added or removed. These tests pin the stability advice:
 * a one-time warning fires when (and only when) the class is within the proximity margin.
 */
class LayoutInferenceProximityTest {

  static class NearFromBelow {}

  static class NearFromAbove {}

  static class FarAway {}

  static class WarnedOnlyOnce {}

  @Test
  void warnsWhenWeightIsJustBelowTheThreshold() {
    assertThat(
            LayoutInference.warnIfNearThreshold(
                NearFromBelow.class,
                "fold-optionals",
                "weight",
                LayoutInference.FOLD_WEIGHT_THRESHOLD - LayoutInference.THRESHOLD_PROXIMITY_MARGIN,
                LayoutInference.FOLD_WEIGHT_THRESHOLD))
        .isTrue();
  }

  @Test
  void warnsWhenWeightIsJustAboveTheThreshold() {
    assertThat(
            LayoutInference.warnIfNearThreshold(
                NearFromAbove.class,
                "fold-optionals",
                "weight",
                LayoutInference.FOLD_WEIGHT_THRESHOLD + LayoutInference.THRESHOLD_PROXIMITY_MARGIN,
                LayoutInference.FOLD_WEIGHT_THRESHOLD))
        .isTrue();
  }

  @Test
  void staysSilentWhenComfortablyFarFromTheThreshold() {
    assertThat(
            LayoutInference.warnIfNearThreshold(
                FarAway.class,
                "fold-optionals",
                "weight",
                LayoutInference.FOLD_WEIGHT_THRESHOLD
                    + LayoutInference.THRESHOLD_PROXIMITY_MARGIN
                    + 1,
                LayoutInference.FOLD_WEIGHT_THRESHOLD))
        .isFalse();
  }

  @Test
  void warnsOnlyOncePerClassAndRule() {
    assertThat(
            LayoutInference.warnIfNearThreshold(
                WarnedOnlyOnce.class,
                "fold-optionals",
                "weight",
                LayoutInference.FOLD_WEIGHT_THRESHOLD,
                LayoutInference.FOLD_WEIGHT_THRESHOLD))
        .isTrue();
    assertThat(
            LayoutInference.warnIfNearThreshold(
                WarnedOnlyOnce.class,
                "fold-optionals",
                "weight",
                LayoutInference.FOLD_WEIGHT_THRESHOLD,
                LayoutInference.FOLD_WEIGHT_THRESHOLD))
        .isFalse();
  }
}
