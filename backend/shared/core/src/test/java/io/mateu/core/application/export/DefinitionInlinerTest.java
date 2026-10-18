package io.mateu.core.application.export;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.dataformat.yaml.YAMLMapper;
import java.net.URLClassLoader;
import java.nio.file.Files;
import java.nio.file.Path;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

/**
 * A specsOnly bundle ships RAW definitions the browser expands — and the browser has neither the
 * partial files nor the business component catalogue, so a page using either rendered "Unknown
 * metadata type Partial" / "Unknown business component" (found walking the static starter). Both
 * are inlined at build time.
 */
class DefinitionInlinerTest {

  private final YAMLMapper yaml = new YAMLMapper();

  @Test
  void splicesAMultiComponentPartialIntoTheListHoldingIt() throws Exception {
    var def =
        yaml.readTree(
            """
            layout:
              type: FormLayout
              content:
                - {type: FormField, id: name}
                - {type: Partial, ref: address-block}
                - {type: Partial, ref: legal-notice}
            """);
    var out = new DefinitionInliner(getClass().getClassLoader()).inline(def);
    var ids = new java.util.ArrayList<String>();
    out.path("layout")
        .path("content")
        .forEach(c -> ids.add(c.path("id").asText(c.path("type").asText())));
    assertThat(ids).containsExactly("name", "street", "city", "Text");
  }

  @Test
  void aCycleIsLeftAsItWasInsteadOfRecursing() throws Exception {
    var def =
        yaml.readTree("layout: {type: VerticalLayout, content: [{type: Partial, ref: loop-a}]}");
    var out = new DefinitionInliner(getClass().getClassLoader()).inline(def);
    assertThat(out.toString()).contains("Partial");
  }

  @Test
  void inlinesABusinessComponentFromComponentsYaml(@TempDir Path dir) throws Exception {
    Files.createDirectories(dir.resolve("specs/ui"));
    Files.writeString(
        dir.resolve("specs/ui/components.yaml"),
        """
        components:
          - name: Agency
            component: {type: Notice, text: From the catalogue}
        """);
    try (var cl = new URLClassLoader(new java.net.URL[] {dir.toUri().toURL()}, null)) {
      var def =
          yaml.readTree(
              "layout: {type: VerticalLayout, content: [{type: ComponentRef, ref: Agency},"
                  + " {type: ComponentRef, ref: Missing}]}");
      var content = new DefinitionInliner(cl).inline(def).path("layout").path("content");
      assertThat(content.get(0).path("type").asText()).isEqualTo("Notice");
      assertThat(content.get(0).path("text").asText()).isEqualTo("From the catalogue");
      // an unknown name stays a reference: the browser shows its graceful placeholder
      assertThat(content.get(1).path("type").asText()).isEqualTo("ComponentRef");
    }
  }

  /** A classloader over a temp project holding {@code files} (path → content). */
  private static URLClassLoader project(Path dir, java.util.Map<String, String> files)
      throws Exception {
    for (var f : files.entrySet()) {
      var path = dir.resolve(f.getKey());
      Files.createDirectories(path.getParent());
      Files.writeString(path, f.getValue());
    }
    return new URLClassLoader(new java.net.URL[] {dir.toUri().toURL()}, null);
  }

  @Test
  void aSelfReferencingBusinessComponentIsLeftAsAReferenceAndTheRestInlines(@TempDir Path dir)
      throws Exception {
    try (var cl =
        project(
            dir,
            java.util.Map.of(
                "specs/ui/components.yaml",
                """
                components:
                  - name: loop
                    component: {type: VerticalLayout, content: [{type: Text, text: inside}, {type: ComponentRef, ref: loop}]}
                  - name: price
                    component: {type: Text, text: Price}
                """))) {
      var def =
          yaml.readTree(
              "layout: {type: VerticalLayout, content: [{type: ComponentRef, ref: loop},"
                  + " {type: ComponentRef, ref: price}]}");
      var content = new DefinitionInliner(cl).inline(def).path("layout").path("content");
      assertThat(content.get(0).path("content").get(0).path("text").asText()).isEqualTo("inside");
      assertThat(content.get(0).path("content").get(1).path("type").asText())
          .isEqualTo("ComponentRef");
      assertThat(content.get(1).path("text").asText()).isEqualTo("Price");
    }
  }

  @Test
  void indirectAndMixedCyclesAreBroken(@TempDir Path dir) throws Exception {
    try (var cl =
        project(
            dir,
            java.util.Map.of(
                "specs/ui/components.yaml",
                """
                components:
                  - name: a
                    component: {type: Card, content: {type: ComponentRef, ref: b}}
                  - name: b
                    component: {type: Card, content: {type: ComponentRef, ref: a}}
                  - name: header
                    component: {type: VerticalLayout, content: [{type: Partial, ref: brand}]}
                """,
                "specs/ui/partials/brand.yaml",
                """
                content:
                  - {type: Text, text: Brand}
                  - {type: ComponentRef, ref: header}
                """))) {
      var inliner = new DefinitionInliner(cl);
      var indirect = inliner.inline(yaml.readTree("{type: ComponentRef, ref: a}"));
      assertThat(indirect.toString())
          .isEqualTo(
              "{\"type\":\"Card\",\"content\":{\"type\":\"Card\",\"content\":"
                  + "{\"type\":\"ComponentRef\",\"ref\":\"a\"}}}");
      var mixed = inliner.inline(yaml.readTree("{type: ComponentRef, ref: header}"));
      assertThat(mixed.path("content").toString())
          .isEqualTo(
              "[{\"type\":\"Text\",\"text\":\"Brand\"},"
                  + "{\"type\":\"ComponentRef\",\"ref\":\"header\"}]");
    }
  }

  @Test
  void aPartialIsNamedByItsShortNameOrAnyExplicitPath(@TempDir Path dir) throws Exception {
    try (var cl =
        project(
            dir,
            java.util.Map.of(
                "specs/ui/partials/address.yaml",
                "content: [{type: FormField, id: street}, {type: FormField, id: city}]",
                "specs/ui/shared/legal.yml",
                "{type: Text, text: Legal}"))) {
      var inliner = new DefinitionInliner(cl);
      for (var ref :
          java.util.List.of(
              "address",
              "specs/ui/partials/address.yaml",
              "partials/address.yaml",
              "/specs/ui/partials/address.yaml")) {
        var out =
            inliner.inline(
                yaml.readTree(
                    "layout: {type: FormLayout, content: [{type: Partial, ref: '" + ref + "'}]}"));
        assertThat(out.path("layout").path("content").toString())
            .as(ref)
            .contains("street")
            .contains("city")
            .doesNotContain("Partial");
      }
      var legal =
          inliner.inline(
              yaml.readTree(
                  "{type: VerticalLayout, content: [{type: Partial, ref: shared/legal.yml}]}"));
      assertThat(legal.path("content").get(0).path("text").asText()).isEqualTo("Legal");
    }
  }
}
