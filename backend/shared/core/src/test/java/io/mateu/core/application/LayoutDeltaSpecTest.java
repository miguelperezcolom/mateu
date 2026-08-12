package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.application.runaction.RouteRegistry;
import io.mateu.core.application.runaction.YamlUidlLoader;
import org.junit.jupiter.api.Test;

/**
 * A page YAML can now carry a {@code layoutDelta:} instead of a {@code layout:}.
 *
 * <p>The two are alternatives with very different consequences: a snapshot takes the screen out of
 * inference for good, a delta lets it keep re-deriving. This pins that the loader reads the delta
 * shape end to end — the editor writing it is the remaining step.
 */
class LayoutDeltaSpecTest {

  @SuppressWarnings("unused")
  public static class DeltaLogic {
    public String name = "Ada";
    public String email = "ada@example.com";
    public String internalNote = "hidden";
  }

  private final YamlUidlLoader loader = new YamlUidlLoader(new RouteRegistry());

  @Test
  void aPageCanDeclareADeltaInsteadOfALayout() {
    var spec = loader.loadSpec("delta-page");
    assertThat(spec).isNotNull();
    assertThat(spec.delta().isEmpty()).isFalse();
  }

  @Test
  void theDeltaCarriesWhatTheHumanDecided() {
    var delta = loader.loadSpec("delta-page").delta();
    assertThat(delta.order()).containsExactly("email", "name");
    assertThat(delta.hidden()).containsExactly("internalNote");
    assertThat(delta.overrideFor("name").label()).isEqualTo("Full name");
    assertThat(delta.overrideFor("name").colspan()).isEqualTo(2);
  }

  @Test
  void theDeltaAppliesOverWhateverInferenceProduces() {
    // The property that matters: `phone` was never mentioned by the human, and appears anyway.
    var delta = loader.loadSpec("delta-page").delta();
    assertThat(delta.applyTo(java.util.List.of("name", "email", "internalNote", "phone")))
        .containsExactly("email", "name", "phone");
  }

  @Test
  void aPageWithNoDeltaCarriesAnEmptyOneRatherThanNull() {
    // So every caller can ask without branching.
    assertThat(loader.loadSpec("by-convention").delta().isEmpty()).isTrue();
  }
}
