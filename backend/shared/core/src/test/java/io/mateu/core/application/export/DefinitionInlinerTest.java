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
}
