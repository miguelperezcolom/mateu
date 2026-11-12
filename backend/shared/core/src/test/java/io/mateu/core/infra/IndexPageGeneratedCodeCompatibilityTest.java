package io.mateu.core.infra;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import org.junit.jupiter.api.Test;

/**
 * The controllers the annotation processors generate are compiled into the app's jar or into a
 * third-party UI module (EventConductor's console): they keep calling the {@link IndexPage.Spec}
 * constructor of the release they were built against. Issue #1167: beta.58 dropped the Keycloak
 * shapes and a module built against beta.52 failed at startup with NoSuchMethodError. Each shape a
 * released template ever emitted must still link and render the same page.
 */
@SuppressWarnings("removal")
class IndexPageGeneratedCodeCompatibilityTest {

  static final String PAGE =
      """
      <html><head><!-- AQUIFAVICON --><title>AQUIELTITULODELAPAGINA</title></head>
      <body><!-- AQUIUI --><mateu-ui></mateu-ui><!-- HASTAAQUIUI --></body></html>
      """;

  @Test
  void theShapeOfBeta52WithoutUiIdStillRendersThePage() {
    var spec =
        new IndexPage.Spec(
            "/_workflow-admin",
            "Workflow admin home",
            "",
            List.of(),
            (IndexPage.Keycloak) null,
            "",
            false);
    assertThat(IndexPage.render(PAGE, spec))
        .isEqualTo(
            IndexPage.render(
                PAGE,
                new IndexPage.Spec(
                    "/_workflow-admin", "Workflow admin home", "", List.of(), "", false, null)));
  }

  @Test
  void theShapeWithKeycloakAndUiIdStillRendersThePageAndIgnoresKeycloak() {
    var legacy =
        new IndexPage.Spec(
            "/admin",
            "Admin",
            "",
            List.of(),
            new IndexPage.Keycloak("https://sso.example.com", "acme", "ui", "/kc.js"),
            "",
            false,
            "com.example.Admin");
    var current =
        new IndexPage.Spec("/admin", "Admin", "", List.of(), "", false, "com.example.Admin");
    assertThat(legacy).isEqualTo(current);
    assertThat(IndexPage.render(PAGE, legacy)).doesNotContain("sso.example.com");
  }
}
