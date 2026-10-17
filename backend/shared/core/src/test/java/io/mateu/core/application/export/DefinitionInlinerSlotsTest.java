package io.mateu.core.application.export;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.dataformat.yaml.YAMLMapper;
import java.net.URLClassLoader;
import java.nio.file.Files;
import java.nio.file.Path;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

/**
 * Where a partial or business component can stand in a shipped definition and what it becomes: in a
 * SINGLE slot (a field value, or the whole definition) one component replaces the reference and
 * several are stacked in a VerticalLayout; a partial can be named by file path; a CLASS partial, a
 * missing file or an unknown component stays a reference for the browser's placeholder.
 */
class DefinitionInlinerSlotsTest {

  private final YAMLMapper yaml = new YAMLMapper();
  @TempDir Path dir;
  URLClassLoader cl;

  @BeforeEach
  void specs() throws Exception {
    Files.createDirectories(dir.resolve("specs/ui/partials"));
    Files.writeString(dir.resolve("specs/ui/partials/one.yaml"), "{type: Text, text: just one}");
    Files.writeString(
        dir.resolve("specs/ui/partials/two.yaml"),
        """
        content:
          - {type: Text, text: first}
          - {type: Partial, ref: one}
        """);
    Files.writeString(dir.resolve("specs/ui/shared-footer.yml"), "{type: Text, text: footer}");
    Files.writeString(
        dir.resolve("specs/ui/components.yaml"),
        """
        - name: Badge
          component: {type: Badge, text: VIP}
        - name: ''
          component: {type: Text, text: nameless}
        - name: NoComponent
        """);
    cl = new URLClassLoader(new java.net.URL[] {dir.toUri().toURL()}, null);
  }

  private JsonNode inline(String yamlText) throws Exception {
    return new DefinitionInliner(cl).inline(yaml.readTree(yamlText));
  }

  @Test
  void aSingleComponentPartialInASlotReplacesTheReference() throws Exception {
    var out = inline("layout: {type: Partial, ref: one}");
    assertThat(out.path("layout").path("type").asText()).isEqualTo("Text");
    assertThat(out.path("layout").path("text").asText()).isEqualTo("just one");
  }

  @Test
  void aMultiComponentPartialInASlotIsStackedAndComposesNestedPartials() throws Exception {
    var layout = inline("layout: {type: Partial, ref: two}").path("layout");
    assertThat(layout.path("type").asText()).isEqualTo("VerticalLayout");
    var texts = new java.util.ArrayList<String>();
    layout.path("content").forEach(c -> texts.add(c.path("text").asText()));
    assertThat(texts).containsExactly("first", "just one");
  }

  @Test
  void aWholeDefinitionThatIsAPartialIsInlinedToo() throws Exception {
    assertThat(inline("{type: Partial, ref: two}").path("type").asText())
        .isEqualTo("VerticalLayout");
    assertThat(inline("{type: Partial, ref: one}").path("text").asText()).isEqualTo("just one");
  }

  @Test
  void aPartialCanBeNamedByItsFilePath() throws Exception {
    var out = inline("footer: {type: Partial, ref: specs/ui/shared-footer.yml}");
    assertThat(out.path("footer").path("text").asText()).isEqualTo("footer");
  }

  @Test
  void classPartialsMissingFilesAndUnknownComponentsStayReferences() throws Exception {
    var content =
        inline(
                """
                layout:
                  type: VerticalLayout
                  content:
                    - {type: Partial, ref: com.acme.ui.AddressPartial}
                    - {type: Partial, ref: nowhere}
                    - {type: Partial}
                    - {type: ComponentRef, ref: Badge}
                    - {type: ComponentRef, ref: NoComponent}
                    - {type: Other, ref: whatever}
                """)
            .path("layout")
            .path("content");
    var types = new java.util.ArrayList<String>();
    content.forEach(c -> types.add(c.path("type").asText()));
    assertThat(types)
        .containsExactly("Partial", "Partial", "Partial", "Badge", "ComponentRef", "Other");
  }

  @Test
  void withoutAComponentCatalogueAReferenceStaysAsItIs(@TempDir Path empty) throws Exception {
    try (var bare = new URLClassLoader(new java.net.URL[] {empty.toUri().toURL()}, null)) {
      var out =
          new DefinitionInliner(bare)
              .inline(yaml.readTree("slot: {type: ComponentRef, ref: Badge}"));
      assertThat(out.path("slot").path("type").asText()).isEqualTo("ComponentRef");
    }
  }
}
