package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.application.contract.ModelViewContractExtractor;
import io.mateu.core.application.runaction.RouteRegistry;
import io.mateu.core.application.runaction.YamlUidlLoader;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.ModelViewContractDto;
import io.mateu.dtos.ServerSideComponentDto;
import java.util.List;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
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

  // ── end to end ────────────────────────────────────────────────────────────
  // Parsing a delta was never the point. These render the page for real and check what a browser
  // would receive — the delta re-applied to the tree inference produced this request.

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    // DeltaLogic carries no route, so /delta-page has no Java route → the YAML fallback fires.
    mateu = TestMateu.withUis(DeltaLogic.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  /**
   * The fields a browser would receive, in order.
   *
   * <p>Read through {@link ModelViewContractExtractor} rather than by walking children: form fields
   * nest inside component METADATA records, so a plain children walk misses them — the same trap
   * the extractor exists to avoid.
   */
  private static List<ModelViewContractDto.Field> renderedFields() {
    var increment = mateu.sync("delta-page");
    assertThat(increment.fragments()).isNotEmpty();
    return ModelViewContractExtractor.extract(
            (ServerSideComponentDto) increment.fragments().get(0).component())
        .fields();
  }

  @Test
  void theRenderedPageCarriesTheOrderAndOmissionTheHumanChose() {
    assertThat(renderedFields())
        .extracting(ModelViewContractDto.Field::id)
        .containsExactly("email", "name");
  }

  @Test
  void theRenderedPageCarriesTheOverridesTheHumanChose() {
    // The label reaches the wire here; colspan is pinned at component level in
    // LayoutDeltaApplierTest, since the contract does not carry it.
    var name =
        renderedFields().stream().filter(f -> "name".equals(f.id())).findFirst().orElseThrow();

    assertThat(name.label()).isEqualTo("Full name");
  }
}
