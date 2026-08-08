package io.mateu.core.application.export;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.application.MateuService;
import io.mateu.core.testutil.TestMateu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import java.time.LocalDate;
import java.util.List;
import lombok.Getter;
import lombok.Setter;
import org.junit.jupiter.api.Test;

/**
 * The build-time exporter renders each route's initial load to wire JSON so a static host can serve
 * the bundle with no backend. Pins: a good route exports ({@code ok}, correct syncPath, real JSON),
 * a route whose load throws is SKIPPED (not fatal) alongside the good ones, and the wire mapper
 * stays byte-compatible with SerializationConfiguration (ISO dates, empty beans OK).
 */
class MateuBundleExporterTest {

  @UI("/bundle-fixture")
  @Title("Bundle Fixture")
  @Getter
  @Setter
  public static class BundleFixture {
    String name = "Alice";
  }

  @UI("/boom")
  public static class BoomFixture {
    // field initializer throws when the view is instantiated on load → export must skip, not fail
    String x = boom();

    private static String boom() {
      throw new RuntimeException("kaboom");
    }
  }

  record WithDate(LocalDate day) {}

  @Test
  void exportsAGoodRouteAndSkipsAThrowingOneInTheSameBatch() {
    try (var mateu = TestMateu.withUis(BundleFixture.class, BoomFixture.class)) {
      var exporter = new MateuBundleExporter(mateu.context().getBean(MateuService.class));

      var manifest = exporter.export("", List.of("/bundle-fixture", "/boom"));

      var good =
          manifest.entries().stream()
              .filter(e -> "/bundle-fixture".equals(e.route()))
              .findFirst()
              .orElseThrow();
      assertThat(good.ok()).isTrue();
      assertThat(good.syncPath()).isEqualTo("bundle-fixture");
      assertThat(good.json()).contains("Bundle Fixture"); // the @Title travels in the increment

      var boom =
          manifest.entries().stream()
              .filter(e -> "/boom".equals(e.route()))
              .findFirst()
              .orElseThrow();
      assertThat(boom.ok()).isFalse();
      assertThat(boom.json()).isNull();
      assertThat(boom.skipReason()).contains("kaboom");
    }
  }

  @Test
  void syncPathMirrorsTheFrontend() {
    assertThat(MateuBundleExporter.toSyncPath("")).isEqualTo("_no_route");
    assertThat(MateuBundleExporter.toSyncPath("/")).isEqualTo("_no_route");
    assertThat(MateuBundleExporter.toSyncPath("/products")).isEqualTo("products");
    assertThat(MateuBundleExporter.toSyncPath("orders/1")).isEqualTo("orders/1");
  }

  @Test
  void wireMapperMatchesSerializationConfiguration() throws Exception {
    var mapper = MateuBundleExporter.defaultWireMapper();
    // ISO-8601, not a numeric timestamp (WRITE_DATES_AS_TIMESTAMPS disabled)
    assertThat(mapper.writeValueAsString(new WithDate(LocalDate.of(2026, 8, 8))))
        .contains("2026-08-08")
        .doesNotContain("1970");
    // FAIL_ON_EMPTY_BEANS disabled → an empty object serializes instead of throwing
    assertThat(mapper.writeValueAsString(new Object())).isEqualTo("{}");
  }
}
