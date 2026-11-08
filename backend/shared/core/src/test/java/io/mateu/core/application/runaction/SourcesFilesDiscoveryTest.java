package io.mateu.core.application.runaction;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import io.mateu.core.testutil.SpecsDir;
import io.mateu.uidl.data.RestSourceEntry;
import java.nio.file.Path;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

/**
 * The source catalogue is authored like every other kind: the conventional {@code
 * specs/ui/sources.yaml} AND any file under {@code specs/ui} declaring {@code type: Sources}. Only
 * the conventional file used to be read, so the Explorer had to keep every source in one shared
 * file (an add/add conflict for every contributor). Names are global: the same name in two files is
 * an error naming both.
 */
class SourcesFilesDiscoveryTest {

  @TempDir Path dir;

  private static final String CONVENTIONAL =
      """
      sources:
        - name: countries
          source: {url: https://api.example.com/countries}
      """;

  private static final String ELSEWHERE =
      """
      type: Sources
      sources:
        - name: planets
          source: {url: https://swapi.example.com/planets}
      """;

  @Test
  void aTypeSourcesFileAnywhereUnderSpecsUiJoinsTheCatalogue() {
    var root =
        SpecsDir.write(
            dir,
            Map.of("sources.yaml", CONVENTIONAL, "explorer/behaviour/sources.yaml", ELSEWHERE));
    var names =
        SpecsDir.over(
            root,
            cl ->
                new RestSourceRegistry()
                    .authoredFrom(cl).sources().stream().map(RestSourceEntry::name).toList());
    assertThat(names).containsExactlyInAnyOrder("countries", "planets");
  }

  @Test
  void theSameNameInTwoFilesIsAnErrorNamingBoth() {
    var root =
        SpecsDir.write(
            dir,
            Map.of(
                "sources.yaml",
                CONVENTIONAL,
                "other/more-sources.yaml",
                ELSEWHERE.replace("planets", "countries")));
    assertThatThrownBy(() -> SpecsDir.over(root, cl -> new RestSourceRegistry().authoredFrom(cl)))
        .hasMessageContaining("countries")
        .hasMessageContaining("specs/ui/sources.yaml")
        .hasMessageContaining("specs/ui/other/more-sources.yaml");
  }
}
