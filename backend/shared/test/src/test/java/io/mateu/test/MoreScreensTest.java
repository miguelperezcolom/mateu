package io.mateu.test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import io.mateu.test.fixtures.HelpPage;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

class MoreScreensTest {

  @Test
  void anActionOpensADrawerAndTheCloseButtonClosesIt() {
    try (var mateu = MateuTest.of(HelpPage.class)) {
      var screen = mateu.open("/help");
      assertEquals("Getting started", screen.field("topic").value());
      screen.button("openHelp").press();
      assertTrue(screen.hasOverlay());
      assertEquals("Help", screen.overlayTitle());
      assertTrue(screen.shows("Read the docs"));
      screen.closeOverlay();
      assertFalse(screen.hasOverlay());
    }
  }

  @Test
  void aYamlMountIsServedFromASpecsDirectory(@TempDir Path dir) throws Exception {
    var specs = Files.createDirectories(dir.resolve("specs/ui"));
    Files.writeString(
        specs.resolve("app.ui.yaml"),
        """
        type: UI
        basePath: /
        home: about
        routes:
          - routes.yaml
        """);
    Files.writeString(
        specs.resolve("routes.yaml"),
        """
        type: Routes
        routes:
          - route: about
            layout: about.yaml
        """);
    Files.writeString(
        specs.resolve("about.yaml"),
        """
        layout:
          type: VerticalLayout
          content:
            - type: Text
              text: "About this app"
        """);
    try (var mateu = MateuTest.builder().specs(dir).start()) {
      assertTrue(mateu.open("/about").shows("About this app"));
    }
  }

  @Test
  void identitiesCanCarryClaims() {
    var identity = Identity.withClaims(Map.of("sub", "ada", "roles", java.util.List.of("admin")));
    assertTrue(identity.toString().contains("ada"), identity.toString());
  }
}
