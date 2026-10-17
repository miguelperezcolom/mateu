package io.mateu.core.infra;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Map;
import org.junit.jupiter.api.Test;

/** M-S2: Mateu's settings are read from the framework's configuration, not only from -D / env. */
class MateuSettingsTest {

  static final String KEY = "mateu.test.settings-probe";

  @Test
  void aFrameworkSourceAnswersBetweenTheSystemPropertyAndTheEnvironment() throws Exception {
    assertThat(MateuSettings.get(KEY)).isNull();
    try (var ignored = MateuSettings.register(Map.of(KEY, " from-framework ")::get)) {
      assertThat(MateuSettings.get(KEY)).isEqualTo("from-framework");
      System.setProperty(KEY, "from-jvm");
      try {
        assertThat(MateuSettings.get(KEY)).isEqualTo("from-jvm");
      } finally {
        System.clearProperty(KEY);
      }
    }
    assertThat(MateuSettings.get(KEY)).isNull();
  }

  @Test
  void onlyTheCurrentContainerIsAsked() throws Exception {
    try (var older = MateuSettings.register(Map.of(KEY, "older")::get)) {
      try (var newer = MateuSettings.register(Map.<String, String>of()::get)) {
        // a key only the OLDER container sets does not leak into the newer one
        assertThat(MateuSettings.get(KEY)).isNull();
      }
      assertThat(MateuSettings.get(KEY)).isEqualTo("older");
    }
  }

  @Test
  void aFailingSourceIsIgnoredAndNullIsHarmless() throws Exception {
    try (var ignored =
        MateuSettings.register(
            key -> {
              throw new IllegalStateException("boom");
            })) {
      assertThat(MateuSettings.get(KEY)).isNull();
      assertThat(MateuSettings.isTrue(KEY)).isFalse();
    }
    MateuSettings.register(null).close();
  }

  @Test
  void theStrictActionSwitchReadsTheFrameworkConfiguration() throws Exception {
    try (var ignored = MateuSettings.register(Map.of("mateu.actions.strict", "false")::get)) {
      assertThat(io.mateu.core.application.security.ActionMethods.isStrict()).isFalse();
    }
    assertThat(io.mateu.core.application.security.ActionMethods.isStrict()).isTrue();
  }
}
