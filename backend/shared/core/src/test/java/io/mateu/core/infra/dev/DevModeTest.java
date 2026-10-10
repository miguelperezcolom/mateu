package io.mateu.core.infra.dev;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.infra.IndexPage;
import java.net.URLClassLoader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Collections;
import java.util.List;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

class DevModeTest {

  @TempDir Path module;

  @AfterEach
  void reset() {
    DevMode.reset();
  }

  @Test
  void offByDefaultEverythingIsAPassThrough() {
    DevMode.disable();
    var cl = getClass().getClassLoader();
    assertThat(DevSpecs.classLoader(cl)).isSameAs(cl);
    var html = "<html><head></head></html>";
    assertThat(IndexPage.devHead(html)).isEqualTo(html);
  }

  @Test
  void inDevModeTheSourcesWinAndTheBuildCopyIsHidden() throws Exception {
    var sources = Files.createDirectories(module.resolve("src/main/resources/specs/ui"));
    var output = Files.createDirectories(module.resolve("target/classes/specs/ui"));
    Files.writeString(sources.resolve("page.yaml"), "from: sources");
    Files.writeString(output.resolve("page.yaml"), "from: build");
    // deleted from the sources, still in the build output: must NOT answer from the stale copy
    Files.writeString(output.resolve("gone.yaml"), "from: build");

    try (var classpath =
        new URLClassLoader(
            new java.net.URL[] {module.resolve("target/classes").toUri().toURL()}, null)) {
      DevMode.enable(sources.toString());
      var cl = DevSpecs.classLoader(classpath);

      try (var in = cl.getResourceAsStream("specs/ui/page.yaml")) {
        assertThat(new String(in.readAllBytes())).isEqualTo("from: sources");
      }
      assertThat(cl.getResource("specs/ui/gone.yaml")).isNull();
      List<java.net.URL> roots = Collections.list(cl.getResources("specs/ui"));
      assertThat(roots).hasSize(1);
      assertThat(roots.get(0).getPath()).contains("src/main/resources/specs/ui");
      // anything that is not a spec is the parent's business
      assertThat(DevSpecs.classLoader(cl)).isSameAs(cl);
    }
  }

  @Test
  void aDeletedFileIsAnAppLevelChange() {
    assertThat(DevSpecs.isAppLevel(module.resolve("nope.yaml"))).isTrue();
  }

  @Test
  void aMountOrShellDefinitionIsAppLevelAndAPageIsNot() throws Exception {
    var shell = Files.writeString(module.resolve("shell.yaml"), "type: AppShell\ntitle: x\n");
    var page = Files.writeString(module.resolve("page.yaml"), "layout:\n  type: Text\n");
    assertThat(DevSpecs.isAppLevel(shell)).isTrue();
    assertThat(DevSpecs.isAppLevel(page)).isFalse();
  }

  @Test
  void theEventStreamOpensWithAHelloCarryingTheBootId() {
    var first = DevEndpoint.events().blockFirst();
    assertThat(first).contains("\"type\":\"hello\"").contains(DevEndpoint.BOOT_ID);
    assertThat(DevEndpoint.sse(first)).startsWith("data: ").endsWith("\n\n");
  }
}
