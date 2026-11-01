package io.mateu.core.application.runaction;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.net.URL;
import java.net.URLClassLoader;
import java.nio.file.Files;
import org.junit.jupiter.api.Test;

/**
 * YAML anchors and aliases in specs files are RESOLVED. Jackson's YAML parser hands an alias over
 * as the string of its name, so {@code museum-artworks: *api} in an environment re-pointed nothing
 * while the log still counted it.
 */
class SpecsYamlAliasesTest {

  @Test
  void anEnvironmentReusingOneBaseUrlThroughAnAliasRePointsEverySource() throws Exception {
    var root = Files.createTempDirectory("specs-aliases");
    var dir = Files.createDirectories(root.resolve("specs/ui/environments"));
    Files.writeString(
        dir.resolve("public.yaml"),
        """
        api: &api {baseUrl: "https://museum-api.example.com"}
        host: &host "https://space-api.example.com"
        sources:
          museum-artworks: *api
          museum-loans: *api
          space-missions: {baseUrl: *host}
          space-crew:
            <<: *api
            proxy: true
        """);
    SpecsIndex.invalidateAll();
    try (var cl = new URLClassLoader(new URL[] {root.toUri().toURL()}, null)) {
      var environment = Environments.all(cl).get("public");

      assertThat(environment).isNotNull();
      var sources = environment.sources();
      assertThat(sources.get("museum-artworks").baseUrl())
          .isEqualTo("https://museum-api.example.com");
      assertThat(sources.get("museum-loans").baseUrl()).isEqualTo("https://museum-api.example.com");
      assertThat(sources.get("space-missions").baseUrl())
          .isEqualTo("https://space-api.example.com");
      // a merge key applies the anchored mapping under the entry's own keys
      assertThat(sources.get("space-crew").baseUrl()).isEqualTo("https://museum-api.example.com");
      assertThat(sources.get("space-crew").proxy()).isTrue();
    } finally {
      SpecsIndex.invalidateAll();
    }
  }

  @Test
  void aFileWithoutAliasesIsReadAsWritten() {
    var yaml = "# a comment\nurl: https://x/*?a=*b\nlist: [1, '*', \"&a\"]\n";
    assertThat(SpecsYaml.expandAliases(yaml)).isSameAs(yaml);
  }

  @Test
  void scalarsKeepTheirTypesAndLongValuesAreNotFolded() throws Exception {
    var longUrl = "https://example.com/" + "segment/".repeat(30) + "${state.id}";
    var tree =
        SpecsYaml.mapper()
            .readTree("base: &b {n: 1, ok: true, s: '007', u: \"" + longUrl + "\"}\ncopy: *b\n");

    assertThat(tree.at("/copy/n").isInt()).isTrue();
    assertThat(tree.at("/copy/ok").isBoolean()).isTrue();
    assertThat(tree.at("/copy/s").asText()).isEqualTo("007");
    assertThat(tree.at("/copy/u").asText()).isEqualTo(longUrl);
  }

  @Test
  void aRunawayExpansionIsRefusedLoudly() {
    var yaml = new StringBuilder("a0: &a0 [x, x]\n");
    for (int i = 1; i < 30; i++) {
      yaml.append("a").append(i).append(": &a").append(i).append(" [*a").append(i - 1);
      yaml.append(", *a").append(i - 1).append("]\n");
    }
    assertThatThrownBy(() -> SpecsYaml.mapper().readTree(yaml.toString()))
        .isInstanceOf(Exception.class);
  }
}
