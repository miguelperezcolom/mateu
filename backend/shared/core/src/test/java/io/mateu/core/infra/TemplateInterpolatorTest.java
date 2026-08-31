package io.mateu.core.infra;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Map;
import org.junit.jupiter.api.Test;

class TemplateInterpolatorTest {

  @Test
  void resolvesStateAndSecretPlaceholdersAndLeavesTheRestBlank() {
    var state = Map.<String, Object>of("zip", "28001");
    java.util.function.Function<String, String> secrets =
        k -> "API_TOKEN".equals(k) ? "s3cr3t" : null;

    assertThat(TemplateInterpolator.interpolate("/x/${state.zip}", state, secrets))
        .isEqualTo("/x/28001");
    assertThat(TemplateInterpolator.interpolate("Bearer ${secret.API_TOKEN}", state, secrets))
        .isEqualTo("Bearer s3cr3t");
    // a state key that is absent and an unknown secret both collapse to empty
    assertThat(TemplateInterpolator.interpolate("${state.missing}-${secret.NOPE}", state, secrets))
        .isEqualTo("-");
  }

  @Test
  void aTemplateWithoutPlaceholdersIsReturnedUntouchedAndNullBecomesEmpty() {
    assertThat(TemplateInterpolator.interpolate("https://api/x", Map.of(), k -> null))
        .isEqualTo("https://api/x");
    assertThat(TemplateInterpolator.interpolate(null, Map.of(), k -> null)).isEmpty();
  }
}
