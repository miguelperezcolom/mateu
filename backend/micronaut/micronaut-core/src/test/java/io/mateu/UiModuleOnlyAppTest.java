package io.mateu;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import io.micronaut.context.ApplicationContext;
import io.micronaut.runtime.server.EmbeddedServer;
import java.io.File;
import java.io.IOException;
import java.net.URL;
import java.net.URLClassLoader;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;
import org.junit.jupiter.api.Test;

/**
 * The two-step build of a Micronaut app whose UI lives ONLY in a separate, framework-agnostic UI
 * module: the module is compiled with the indexer, the app (no {@code @UI} source of its own, just
 * its main class) with Micronaut's processors and Mateu's Micronaut AP, the UI module on the
 * processor path. The controllers Mateu generates must reach Micronaut's bean-definition processor,
 * or the app boots and answers 404 on every mount — they used to be generated in the LAST round,
 * which javac hands to no processor.
 *
 * <p>javac runs as its own process, as in a consumer's build: in-process, its processor class
 * loader delegates to the test class loader first, so Mateu's AP would not see the UI module.
 */
class UiModuleOnlyAppTest {

  private static final String UI_MODULE_HOME =
      """
      package com.acme.uionly;
      @io.mateu.uidl.annotations.UI("/ui-module-only")
      public class Shell {}
      """;

  private static final String APP_MAIN =
      """
      package com.acme.uionly.app;
      public class Application {
        public static void main(String[] args) {
          io.micronaut.runtime.Micronaut.run(Application.class, args);
        }
      }
      """;

  @Test
  void theControllersOfAnIndexedMountBecomeMicronautBeansAndServeIt() throws Exception {
    Path ui =
        compile(
            "com.acme.uionly.Shell",
            UI_MODULE_HOME,
            List.of(),
            List.of("-processor", "io.mateu.annotationprocessing.indexer.MateuUIIndexerProcessor"));
    assertTrue(Files.exists(ui.resolve("META-INF/mateu/ui-registrations")));

    Path app = compile("com.acme.uionly.app.Application", APP_MAIN, List.of(ui), List.of());
    assertTrue(
        Files.exists(app.resolve("com/acme/uionly/$ShellMateuController$Definition.class")),
        () -> "Micronaut registered the generated sync controller as a bean: " + listing(app));
    assertTrue(
        Files.exists(app.resolve("com/acme/uionly/$ShellController$Definition.class")),
        () -> "Micronaut registered the generated index controller as a bean: " + listing(app));

    try (URLClassLoader loader =
            new URLClassLoader(
                new URL[] {ui.toUri().toURL(), app.toUri().toURL()}, getClass().getClassLoader());
        ApplicationContext context =
            ApplicationContext.builder()
                .classLoader(loader)
                .properties(Map.of("micronaut.server.port", -1))
                .start()) {
      EmbeddedServer server = context.getBean(EmbeddedServer.class).start();
      HttpResponse<String> page =
          HttpClient.newHttpClient()
              .send(
                  HttpRequest.newBuilder(server.getURI().resolve("/ui-module-only")).build(),
                  HttpResponse.BodyHandlers.ofString());
      assertEquals(200, page.statusCode());
      assertTrue(page.body().contains("mateu-ui"), page.body());
    }
  }

  /**
   * Compiles one source with every processor of the test classpath, plus {@code extra} on both the
   * class path and the processor path (as {@code annotationProcessorPaths} does for a UI module).
   */
  private static Path compile(
      String className, String code, List<Path> extra, List<String> moreOptions)
      throws IOException, InterruptedException {
    Path work = Files.createTempDirectory("mateu-mn");
    Path src = work.resolve("src/" + className.replace('.', '/') + ".java");
    Files.createDirectories(src.getParent());
    Files.writeString(src, code);
    Path out = Files.createDirectories(work.resolve("classes"));
    Path generated = Files.createDirectories(work.resolve("generated"));
    String path =
        classpath() + extra.stream().map(p -> File.pathSeparator + p).collect(Collectors.joining());

    List<String> args = new ArrayList<>();
    args.addAll(
        List.of(
            "-classpath",
            path,
            "-processorpath",
            path,
            "-parameters",
            "-s",
            generated.toString(),
            "-d",
            out.toString()));
    args.addAll(moreOptions);
    args.add(src.toString());
    Path argFile = work.resolve("javac.args");
    Files.write(
        argFile,
        args.stream().map(a -> "\"" + a.replace("\\", "\\\\") + "\"").toList(),
        StandardCharsets.UTF_8);

    Path javac = Path.of(System.getProperty("java.home"), "bin", "javac");
    Process process =
        new ProcessBuilder(javac.toString(), "@" + argFile).redirectErrorStream(true).start();
    String report = new String(process.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
    assertTrue(process.waitFor(5, TimeUnit.MINUTES), "javac finished");
    assertEquals(0, process.exitValue(), report);
    assertFalse(report.contains("last round"), report);
    return out;
  }

  private static String listing(Path dir) {
    try (var walk = Files.walk(dir)) {
      return walk.filter(Files::isRegularFile)
          .map(p -> dir.relativize(p).toString())
          .sorted()
          .collect(Collectors.joining(", "));
    } catch (IOException e) {
      return e.toString();
    }
  }

  /** Surefire may hand the fork a manifest-only jar; it names the real test classpath here. */
  private static String classpath() {
    String surefire = System.getProperty("surefire.test.class.path");
    return surefire != null && !surefire.isBlank()
        ? surefire
        : System.getProperty("java.class.path");
  }
}
