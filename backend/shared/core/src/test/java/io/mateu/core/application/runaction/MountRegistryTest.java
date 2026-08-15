package io.mateu.core.application.runaction;

import static org.assertj.core.api.Assertions.assertThat;

import java.net.URL;
import java.net.URLClassLoader;
import java.nio.file.Files;
import java.nio.file.Path;
import org.junit.jupiter.api.Test;

/**
 * Mount discovery ({@code type: UI} files) and the per-mount route registry: several route files
 * merged (last wins) and prefixed with the mount base path into absolute routes. Exercised over a
 * throwaway classpath (a temp dir behind a {@link URLClassLoader}) so it does not touch the shared
 * test resources.
 */
class MountRegistryTest {

  private Path writeMount() throws Exception {
    var root = Files.createTempDirectory("mount-test");
    var ui = Files.createDirectories(root.resolve("specs/ui"));
    Files.writeString(
        ui.resolve("back-office.ui.yaml"),
        """
        type: UI
        basePath: /back-office
        routes:
          - orders-routes.yaml
          - shared-routes.yaml
        """);
    Files.writeString(
        ui.resolve("orders-routes.yaml"),
        """
        routes:
          - route: ""
            definition: app.yaml
          - route: orders
            definition: orders.yaml
        """);
    // Collides with orders-routes.yaml on `orders`; being LAST in the mount's list it wins.
    Files.writeString(
        ui.resolve("shared-routes.yaml"),
        """
        routes:
          - route: orders
            definition: orders-v2.yaml
        """);
    return root;
  }

  private URLClassLoader loaderOver(Path root) throws Exception {
    return new URLClassLoader(new URL[] {root.toUri().toURL()}, null);
  }

  @Test
  void discoversAMountFromItsTypeUiFile() throws Exception {
    var cl = loaderOver(writeMount());
    var mounts = new MountRegistry().mounts(cl);
    assertThat(mounts).hasSize(1);
    assertThat(mounts.get(0).basePath()).isEqualTo("back-office"); // normalized, no slashes
    assertThat(mounts.get(0).routeFiles())
        .containsExactly("orders-routes.yaml", "shared-routes.yaml");
  }

  @Test
  void flattensRouteFilesToAbsoluteRoutes_lastFileWinsOnCollision() throws Exception {
    var cl = loaderOver(writeMount());
    var table = new RouteRegistry().authoredFrom(cl);

    // Routes are prefixed with the base path.
    assertThat(table.routes()).extracting("route").contains("back-office", "back-office/orders");
    // On the `orders` collision the LAST route file wins.
    assertThat(table.match("back-office/orders").orElseThrow().entry().definition())
        .isEqualTo("orders-v2.yaml");
    // The mount root carries the app definition.
    assertThat(table.match("back-office").orElseThrow().entry().definition()).isEqualTo("app.yaml");
  }

  @Test
  void rootDefinitionAndMountRootAreResolvedForAnyRouteUnderTheMount() throws Exception {
    var previous = Thread.currentThread().getContextClassLoader();
    try {
      Thread.currentThread().setContextClassLoader(loaderOver(writeMount()));
      var registry = new RouteRegistry();
      // The app definition is the one bound to the mount's root, resolvable from any inner route.
      assertThat(registry.rootDefinitionFor("back-office/orders")).isEqualTo("app.yaml");
      assertThat(registry.rootDefinitionFor("back-office")).isEqualTo("app.yaml");
      assertThat(registry.isMountRoot("back-office")).isTrue();
      assertThat(registry.isMountRoot("back-office/orders")).isFalse();
    } finally {
      Thread.currentThread().setContextClassLoader(previous);
    }
  }

  @Test
  void noTypeUiFileFallsBackToTheConventionalRootRoutesFile() throws Exception {
    var root = Files.createTempDirectory("mount-test-plain");
    var ui = Files.createDirectories(root.resolve("specs/ui"));
    Files.writeString(
        ui.resolve("routes.yaml"),
        """
        routes:
          - route: orders
            viewModel: com.acme.Orders
        """);
    var table = new RouteRegistry().authoredFrom(loaderOver(root));
    assertThat(table.match("orders").orElseThrow().entry().viewModel())
        .isEqualTo("com.acme.Orders");
  }
}
