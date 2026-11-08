package io.mateu.core.domain.out.componentmapper;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.parallel.ResourceLock;

/**
 * One naming scheme for the global inference switches ({@code mateu.layout.inference.enabled},
 * {@code mateu.page.inference.enabled}); the pre-3.0 names were removed and are ignored.
 */
@ResourceLock("system-properties")
class InferenceSwitchesTest {

  private static final List<String> KEYS =
      List.of(
          InferenceSwitches.LAYOUT,
          InferenceSwitches.PAGE,
          "mateu.layout.inference",
          "mateu.page.inference.disabled");

  @BeforeEach
  @AfterEach
  void clean() {
    KEYS.forEach(System::clearProperty);
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
  }

  @Test
  void theRemovedPre30NamesAreIgnored() {
    System.setProperty("mateu.layout.inference", "true");
    System.setProperty("mateu.page.inference.disabled", "true");
    assertThat(InferenceSwitches.layoutInferenceEnabled()).isFalse();
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
