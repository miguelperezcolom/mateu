package io.mateu.core.application.runaction;

import static org.assertj.core.api.Assertions.assertThat;

import java.net.URL;
import java.net.URLClassLoader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;
import java.util.jar.JarEntry;
import java.util.jar.JarOutputStream;
import org.junit.jupiter.api.Test;

/**
 * A UI module shipped as a JAR (a third-party module mounted in-process) carries its {@code
 * specs/ui/**} inside the jar: the mounts, its standalone route files and its project descriptor
 * have to be discovered there exactly as from a directory.
 */
class MountRegistryJarTest {

  private static Path jarWith(Map<String, String> entries) throws Exception {
    var jar = Files.createTempFile("ui-module", ".jar");
    try (var out = new JarOutputStream(Files.newOutputStream(jar))) {
      // the directory entry is what ClassLoader.getResources("specs/ui") finds inside a jar
      out.putNextEntry(new JarEntry("specs/"));
      out.closeEntry();
      out.putNextEntry(new JarEntry("specs/ui/"));
      out.closeEntry();
      for (var entry : entries.entrySet()) {
        out.putNextEntry(new JarEntry(entry.getKey()));
        out.write(entry.getValue().getBytes(StandardCharsets.UTF_8));
        out.closeEntry();
      }
    }
    return jar;
  }

  private static URLClassLoader loaderOver(Path jar) throws Exception {
    return new URLClassLoader(new URL[] {jar.toUri().toURL()}, null);
  }

  private static final Map<String, String> MODULE =
      Map.of(
          "specs/ui/console.ui.yaml",
          """
          type: UI
          basePath: /console/
          home: jobs
          routes: console-routes.yaml
          """,
          "specs/ui/console-routes.yaml",
          """
          - route: jobs
            definition: jobs.yaml
          - route: workers
            definition: workers.yaml
          """,
          "specs/ui/extra/admin-routes.yaml",
          """
          type: Routes
          basePath: /console
          routes:
            - route: admin
              definition: admin.yaml
          """,
          "specs/ui/project.yaml",
          """
          type: Project
          renderer: vaadin
          """,
          "specs/ui/broken.yaml",
          "type: [UI\n",
          "specs/ui/readme.txt",
          "not a spec");

  @Test
  void aMountInsideAJarIsDiscoveredWithItsSingleRouteFileAndHome() throws Exception {
    var mounts = new MountRegistry().mounts(loaderOver(jarWith(MODULE)));
    assertThat(mounts)
        .singleElement()
        .satisfies(
            mount -> {
              assertThat(mount.basePath()).isEqualTo("console");
              assertThat(mount.routeFiles()).containsExactly("console-routes.yaml");
              assertThat(mount.home()).isEqualTo("jobs");
              assertThat(mount.descriptor()).isEqualTo("specs/ui/console.ui.yaml");
            });
  }

  @Test
  void standaloneRouteFilesAndTheProjectDescriptorAreFoundInSubfoldersOfTheJar() throws Exception {
    var cl = loaderOver(jarWith(MODULE));
    var registry = new MountRegistry();
    assertThat(registry.routeFileMounts(cl))
        .singleElement()
        .satisfies(
            file -> {
              assertThat(file.basePath()).isEqualTo("console");
              assertThat(file.resourcePath()).isEqualTo("specs/ui/extra/admin-routes.yaml");
            });
    assertThat(registry.projectDescriptors(cl)).containsExactly("specs/ui/project.yaml");
    assertThat(MountRegistry.yamlResourcePaths(cl))
        .contains("specs/ui/console.ui.yaml", "specs/ui/broken.yaml")
        .doesNotContain("specs/ui/readme.txt");
  }

  @Test
  void theJarsRoutesAreServedUnderItsMountWithTheHomeAtTheRoot() throws Exception {
    var table = new RouteRegistry().authoredFrom(loaderOver(jarWith(MODULE)));
    assertThat(table.routes())
        .extracting("route")
        .contains("console/jobs", "console/workers", "console/admin", "console");
    assertThat(table.match("console").orElseThrow().entry().definition()).isEqualTo("jobs.yaml");
  }

  @Test
  void aHomeThatIsNotARouteOfTheMountIsIgnored() throws Exception {
    var module =
        Map.of(
            "specs/ui/bad.ui.yaml",
            """
            type: UI
            basePath: /bad
            home: ghost
            routes:
              - bad-routes.yaml
            """,
            "specs/ui/bad-routes.yaml",
            """
            routes:
              - route: real
                definition: real.yaml
              - route: items/:id
                definition: item.yaml
            """);
    var registry = new RouteRegistry();
    var table = registry.authoredFrom(loaderOver(jarWith(module)));
    assertThat(table.match("bad")).isEmpty();
    assertThat(registry.mountHomes()).isEmpty();

    var parameterised =
        Map.of(
            "specs/ui/p.ui.yaml",
            "type: UI\nbasePath: /p\nhome: items/:id\nroutes: [p-routes.yaml]\n",
            "specs/ui/p-routes.yaml",
            "routes:\n  - route: items/:id\n    definition: item.yaml\n");
    var other = new RouteRegistry();
    other.authoredFrom(loaderOver(jarWith(parameterised)));
    assertThat(other.mountHomes()).isEmpty();
  }
}
