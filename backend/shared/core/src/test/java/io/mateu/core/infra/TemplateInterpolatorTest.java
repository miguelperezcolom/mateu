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

  @Test
  void aMoneyValueIsItsAmountAndItsCurrencyIsReachable() {
    // what a `dataType: money` field holds; it used to land as `{value=12500000, currency=EUR, …}`
    var state =
        Map.<String, Object>of(
            "v", Map.of("value", 12500000, "currency", "EUR", "locale", "es-ES"),
            "d", Map.of("value", 1.25E7, "currency", "USD"));
    var body =
        TemplateInterpolator.interpolate(
            "{\"v\":\"${state.v}\",\"c\":\"${state.v.currency}\",\"d\":${state.d}}",
            state,
            k -> null,
            TemplateInterpolator::jsonEscape);
    assertThat(body).isEqualTo("{\"v\":\"12500000\",\"c\":\"EUR\",\"d\":12500000}");
  }

  @Test
  void aNestedPathAndAFallback() {
    var state = Map.<String, Object>of("a", Map.of("b", "x"), "flat.key", "y");
    assertThat(TemplateInterpolator.interpolate("${state.a.b}", state, k -> null)).isEqualTo("x");
    // a flat key that contains a dot still wins, as before
    assertThat(TemplateInterpolator.interpolate("${state.flat.key}", state, k -> null))
        .isEqualTo("y");
    assertThat(TemplateInterpolator.interpolate("${state.none ?? 'n/a'}", state, k -> null))
        .isEqualTo("n/a");
  }
}
