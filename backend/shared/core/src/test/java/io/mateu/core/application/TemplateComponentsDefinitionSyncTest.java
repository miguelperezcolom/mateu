package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.mateu.core.testutil.TestMateu;
import java.nio.file.Files;
import java.nio.file.Path;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * The Java goldens for the component shapes the IDE "New › Mateu › Page…" templates use and the
 * client-side expander used to leave RAW in metadata (Phase 6, coherence-plan #1): a Scoreboard's
 * {@code metrics}, a TabLayout's {@code tabs} (and each Tab's {@code content}), a FoldoutLayout's
 * {@code overview}/{@code panels}, a Card's component {@code title} and a Form's {@code header} /
 * {@code avatar}. Each definition-only route (specs/ui/template-*.yaml) is rendered by the server;
 * the TypeScript expander must reproduce this wire in the browser (expandTemplateComponents.test.ts
 * compares against the captured JSON with {@code expectSubset}).
 *
 * <p>Regenerate the fixtures with {@code -Dexpander.golden.write=true}: they are written to
 * libs/mateu/src/mateu/ui/infra/expander/__fixtures__/&lt;route&gt;.golden.json.
 */
class TemplateComponentsDefinitionSyncTest {

  static final Path FIXTURES =
      Path.of("../../../frontend/web/monorepo/libs/mateu/src/mateu/ui/infra/expander/__fixtures__");

  static TestMateu mateu;
  static final ObjectMapper MAPPER = new ObjectMapper();

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis();
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  /** The rendered component of a definition-only route, written as a golden when asked to. */
  private static JsonNode render(String route) throws Exception {
    var increment = mateu.sync("/" + route);
    assertThat(increment.fragments()).as(route + " should render").isNotEmpty();
    var json = MAPPER.writerWithDefaultPrettyPrinter().writeValueAsString(increment);
    if (Boolean.getBoolean("expander.golden.write")) {
      Files.writeString(FIXTURES.resolve(route + ".golden.json"), json + "\n");
    }
    return MAPPER.readTree(json).path("fragments").path(0).path("component");
  }

  @Test
  void aScoreboardLiftsItsMetricsToChildren() throws Exception {
    var component = render("template-scoreboard");
    assertThat(component.path("metadata").path("type").asText()).isEqualTo("Scoreboard");
    assertThat(component.path("metadata").has("metrics")).isFalse();
    assertThat(component.path("children")).hasSize(2);
    assertThat(component.path("children").path(0).path("metadata").path("type").asText())
        .isEqualTo("MetricCard");
    assertThat(component.path("children").path(0).path("metadata").path("trend").asText())
        .isEqualTo("up");
  }

  @Test
  void aTabLayoutLiftsItsTabsAndEachTabItsContentToChildren() throws Exception {
    var component = render("template-tabs");
    assertThat(component.path("metadata").path("type").asText()).isEqualTo("TabLayout");
    assertThat(component.path("metadata").has("tabs")).isFalse();
    var details = component.path("children").path(0);
    assertThat(details.path("metadata").path("type").asText()).isEqualTo("Tab");
    assertThat(details.path("metadata").path("label").asText()).isEqualTo("Details");
    assertThat(details.path("metadata").path("active").asBoolean()).isTrue();
    assertThat(details.path("children").path(0).path("metadata").path("text").asText())
        .isEqualTo("Details go here");
  }

  @Test
  void aFoldoutSlotsItsOverviewAndPanelContentsAndKeepsPanelHeadersInMetadata() throws Exception {
    var component = render("template-foldout");
    var metadata = component.path("metadata");
    assertThat(metadata.path("type").asText()).isEqualTo("FoldoutLayout");
    assertThat(metadata.has("overview")).isFalse();
    assertThat(metadata.path("panels")).hasSize(3);
    assertThat(metadata.path("panels").path(0).path("width").asText()).isEqualTo("30rem");
    assertThat(metadata.path("panels").path(1).path("open").asBoolean()).isFalse();
    assertThat(metadata.path("badges").path(0).asText()).isEqualTo("Confirmed");
    var children = component.path("children");
    assertThat(children).hasSize(3); // the Notes panel has no content: no child, a gap in panel-N
    assertThat(children.path(0).path("slot").asText()).isEqualTo("overview");
    assertThat(children.path(1).path("slot").asText()).isEqualTo("panel-0");
    assertThat(children.path(2).path("slot").asText()).isEqualTo("panel-2");
  }

  @Test
  void aCardExpandsItsComponentTitleInPlace() throws Exception {
    var component = render("template-card-title");
    var title = component.path("metadata").path("title");
    assertThat(title.path("type").asText()).isEqualTo("ClientSide");
    assertThat(title.path("metadata").path("text").asText()).isEqualTo("Contact");
    assertThat(component.path("children")).isEmpty();
  }

  @Test
  void aFormExpandsItsHeaderAndAvatarInPlace() throws Exception {
    var component = render("template-form-header");
    var metadata = component.path("metadata");
    assertThat(metadata.path("header")).hasSize(2);
    assertThat(metadata.path("header").path(0).path("type").asText()).isEqualTo("ClientSide");
    assertThat(metadata.path("header").path(1).path("metadata").path("type").asText())
        .isEqualTo("ProgressBar");
    assertThat(metadata.path("avatar").path("style").asText()).contains("width: 4rem");
  }
}
