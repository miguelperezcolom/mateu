package io.mateu.core.application.export;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.dataformat.yaml.YAMLMapper;
import io.mateu.uidl.data.Access;
import io.mateu.uidl.data.RouteEntry;
import io.mateu.uidl.data.RouteTable;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

/**
 * A bundle's manifest never ships a definition that depends on WHO asks: the browser expander
 * renders whatever it is given, for everybody, so a raw definition with {@code eyesOnly:} — or one
 * only access-restricted routes use — would hand every visitor what the keys withhold. Those routes
 * stay backend-served ({@code yamlAccessRestriction}); this pins that their files do not travel.
 */
class GuardedDefinitionsTest {

  private static JsonNode yaml(String text) {
    try {
      return new YAMLMapper().readTree(text);
    } catch (Exception e) {
      throw new IllegalStateException(e);
    }
  }

  private static final JsonNode PLAIN =
      yaml("layout: {type: VerticalLayout, content: [{type: Text, text: Public}]}");
  private static final JsonNode GUARDED =
      yaml(
          """
          layout:
            type: VerticalLayout
            content:
              - {type: Text, text: Public}
              - {type: Text, text: Salaries, eyesOnly: {roles: [hr]}}
          """);

  private static RouteEntry entry(String route, String definition, Access access) {
    return RouteEntry.builder().route(route).definition(definition).access(access).build();
  }

  @Test
  void aDefinitionDeclaringAccessKeysIsNotShipped() {
    var authored = new RouteTable(List.of(entry("salaries", "salaries.yaml", null)));
    var shipped =
        MateuBundleExporter.withoutGuardedDefinitions(Map.of("salaries.yaml", GUARDED), authored);
    assertThat(shipped).doesNotContainKey("salaries.yaml");
  }

  @Test
  void aDefinitionOnlyRestrictedRoutesUseIsNotShipped() {
    var authored =
        new RouteTable(
            List.of(entry("admin", "admin.yaml", new Access(List.of("admin"), null, null, null))));
    var shipped =
        MateuBundleExporter.withoutGuardedDefinitions(Map.of("admin.yaml", PLAIN), authored);
    assertThat(shipped).doesNotContainKey("admin.yaml");
  }

  @Test
  void aDefinitionAPublicRouteAlsoUsesShips() {
    var authored =
        new RouteTable(
            List.of(
                entry("about", "about.yaml", null),
                entry("about-admin", "about.yaml", new Access(List.of("admin"), null, null, null)),
                entry("open", "open.yaml", new Access(List.of(), null, null, null))));
    var shipped =
        MateuBundleExporter.withoutGuardedDefinitions(
            Map.of("about.yaml", PLAIN, "open.yaml", PLAIN), authored);
    assertThat(shipped).containsKeys("about.yaml", "open.yaml");
  }
}
