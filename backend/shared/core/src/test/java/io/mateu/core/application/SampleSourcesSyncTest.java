package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.JsonNode;
import io.mateu.core.application.export.MateuBundleExporter;
import io.mateu.core.application.runaction.RestSourceRegistry;
import io.mateu.core.application.runaction.SampleSources;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;

/**
 * SAMPLE data on REST sources ({@code sample:} / {@code sampleFile:} in sources.yaml): used instead
 * of calling the endpoint ONLY in sample mode — here the server's opt-in {@code
 * mateu.sources.mock=true} — and never otherwise. The proxied leg is what this pins (the browser's
 * direct leg is pinned by {@code restSourceCatalogue.test.ts}); the source points at a closed port,
 * so a real call fails and a sample is unmistakable.
 */
class SampleSourcesSyncTest {

  @AfterEach
  void clearOptIn() {
    System.clearProperty(SampleSources.PROPERTY);
    System.clearProperty(SampleSources.BUNDLE_PROPERTY);
  }

  @SuppressWarnings("unchecked")
  private static Map<String, Object> restfetch(String actionId) {
    return SpecsFixture.over(
        "field-types",
        () -> {
          try (var mateu = TestMateu.withUis()) {
            var increment =
                mateu.run(
                    RunActionRqDto.builder()
                        .route("/ft-sampled")
                        .consumedRoute("_empty")
                        .actionId("__restfetch__")
                        .parameters(Map.of("_sourceKind", "action", "_sourceId", actionId))
                        .componentState(Map.of("customer", "Initech"))
                        .build());
            return (Map<String, Object>) increment.appData();
          }
        });
  }

  @Test
  void withoutTheOptInTheEndpointIsCalledForReal() {
    assertThat(restfetch("load"))
        .as("no sample mode: the (closed) endpoint is called and fails")
        .containsKey("_restfetchError")
        .doesNotContainKey("_restfetch");
  }

  @Test
  @SuppressWarnings("unchecked")
  void withTheOptInAReadAnswersWithTheSample() {
    System.setProperty(SampleSources.PROPERTY, "true");
    var body = (Map<String, Object>) restfetch("load").get("_restfetch");
    assertThat(body).isNotNull();
    assertThat((List<Object>) body.get("data")).hasSize(2);
    assertThat(((Map<String, Object>) body.get("meta")).get("total")).isEqualTo(2);
  }

  @Test
  void withTheOptInAWriteSucceedsWithoutPersisting() {
    System.setProperty(SampleSources.PROPERTY, "true");
    assertThat(restfetch("create"))
        .doesNotContainKey("_restfetchError")
        .containsEntry("_restfetch", Map.of());
  }

  @Test
  void aSampleFileIsReadRelativeToSpecsUi() {
    var catalog =
        SpecsFixture.over(
            "field-types",
            () ->
                new RestSourceRegistry()
                    .authoredFrom(Thread.currentThread().getContextClassLoader()));
    assertThat(catalog.get("customers").orElseThrow().effectiveSample())
        .isEqualTo(List.of(Map.of("id", 7, "name", "Acme")));
  }

  private static MateuBundleExporter.BundleManifest export() {
    return SpecsFixture.over(
        "field-types",
        () -> {
          try (var mateu = TestMateu.withUis()) {
            var exporter = new MateuBundleExporter(mateu.context().getBean(MateuService.class));
            return exporter.exportAll(
                "", Thread.currentThread().getContextClassLoader(), true, false, true);
          }
        });
  }

  @Test
  void aBundleShipsNoSamplesUnlessBuiltWithTheMockFlag() {
    var plain = export();
    assertThat(plain.mockSources()).isNull();
    assertThat(plain.sources().get("orders").orElseThrow().effectiveSample()).isNull();

    System.setProperty(SampleSources.BUNDLE_PROPERTY, "true");
    var mocked = export();
    assertThat(mocked.mockSources()).isTrue();
    assertThat(mocked.sources().get("orders").orElseThrow().effectiveSample()).isNotNull();
  }

  @Test
  void aBundlesRawDefinitionsTravelWithTheirFieldTypesResolved() {
    JsonNode orders = export().definitions().get("orders.yaml");
    assertThat(orders).isNotNull();
    assertThat(orders.toString()).doesNotContain("fieldType");
    assertThat(orders.path("columns").get(1).path("dataType").asText()).isEqualTo("status");
    assertThat(orders.path("columns").get(1).path("tones").path("OPEN").asText())
        .isEqualTo("warning");
  }
}
