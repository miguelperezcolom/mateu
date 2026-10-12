package io.mateu.core.domain.out.componentmapper;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.parallel.ResourceLock;

/**
 * One naming scheme for the global inference switches ({@code mateu.layout.inference.enabled},
 * {@code mateu.page.inference.enabled}); the old names keep working, with a one-time WARN.
 */
@ResourceLock("system-properties")
class InferenceSwitchesTest {

  private static final List<String> KEYS =
      List.of(
          InferenceSwitches.LAYOUT,
          InferenceSwitches.PAGE,
          InferenceSwitches.LEGACY_LAYOUT,
          InferenceSwitches.LEGACY_PAGE_DISABLED);

  @BeforeEach
  @AfterEach
  void clean() {
    KEYS.forEach(System::clearProperty);
    InferenceSwitches.resetWarnings();
  }

  @Test
  void defaultsLayoutOffAndPageOn() {
    assertThat(InferenceSwitches.layoutInferenceEnabled()).isFalse();
    assertThat(InferenceSwitches.pageInferenceEnabled()).isTrue();
  }

  @Test
  void theNewSwitchesTurnEachOneOnAndOff() {
    System.setProperty(InferenceSwitches.LAYOUT, "true");
    System.setProperty(InferenceSwitches.PAGE, "false");
    assertThat(InferenceSwitches.layoutInferenceEnabled()).isTrue();
    assertThat(InferenceSwitches.pageInferenceEnabled()).isFalse();
    assertThat(InferenceSwitches.warned(InferenceSwitches.LEGACY_LAYOUT)).isFalse();
  }

  @Test
  void theOldLayoutSwitchStillWorksAndWarns() {
    System.setProperty(InferenceSwitches.LEGACY_LAYOUT, "true");
    assertThat(InferenceSwitches.layoutInferenceEnabled()).isTrue();
    assertThat(InferenceSwitches.warned(InferenceSwitches.LEGACY_LAYOUT)).isTrue();
  }

  @Test
  void theOldPageSwitchKeepsItsInvertedPolarityAndWarns() {
    System.setProperty(InferenceSwitches.LEGACY_PAGE_DISABLED, "true");
    assertThat(InferenceSwitches.pageInferenceEnabled()).isFalse();
    assertThat(InferenceSwitches.warned(InferenceSwitches.LEGACY_PAGE_DISABLED)).isTrue();
  }

  @Test
  void theNewNameWinsOverTheOldOne() {
    System.setProperty(InferenceSwitches.LEGACY_LAYOUT, "true");
    System.setProperty(InferenceSwitches.LAYOUT, "false");
    assertThat(InferenceSwitches.layoutInferenceEnabled()).isFalse();
    System.setProperty(InferenceSwitches.LEGACY_PAGE_DISABLED, "true");
    System.setProperty(InferenceSwitches.PAGE, "true");
    assertThat(InferenceSwitches.pageInferenceEnabled()).isTrue();
  }

  @Test
  void theAnnotationStillWinsOverTheSwitch() {
    System.setProperty(InferenceSwitches.LAYOUT, "true");
    assertThat(LayoutInference.enabled(OptedOut.class)).isFalse();
    assertThat(LayoutInference.enabled(Plain.class)).isTrue();
  }

  @io.mateu.uidl.annotations.AutoLayout(false)
  static class OptedOut {}

  static class Plain {}
}
