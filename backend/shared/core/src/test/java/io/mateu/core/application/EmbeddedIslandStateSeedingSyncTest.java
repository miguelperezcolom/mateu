package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.mateu.core.infra.declarative.orchestrators.editableview.AutoEditableView;
import io.mateu.core.testutil.TestMateu;
import io.mateu.uidl.annotations.Hidden;
import io.mateu.uidl.annotations.Inline;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * Embedded orchestrator islands receive host context on their FIRST render: the host field VALUE's
 * simple fields (a configured stayId…) are seeded into the island's initialData (which becomes its
 * componentState), so the island hydrates with them — no events or route params.
 */
class EmbeddedIslandStateSeedingSyncTest {

  public static class Doc {
    public String texto = "hola";
  }

  @SuppressWarnings("unused")
  @UI("/island")
  @Title("Island")
  public static class IslandView extends AutoEditableView<Doc> {
    @Hidden String stayId;

    @Override
    public Doc load(HttpRequest httpRequest) {
      return new Doc();
    }

    @Override
    public void persist(Doc entity, HttpRequest httpRequest) {}
  }

  @SuppressWarnings("unused")
  @UI("/host")
  @Title("Host")
  public static class HostPage {
    // a normal field so the page classifies as a FORM (the demo hosts are forms/wizard steps)
    public String nombre = "n";

    @Inline IslandView isla;

    public HostPage() {
      isla = new IslandView();
      isla.stayId = "st-maria";
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(HostPage.class, IslandView.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  @Test
  void hostFieldValueSimpleStateIsSeededIntoTheIslandInitialData() throws Exception {
    var increment = mateu.sync("/host");
    JsonNode root = new ObjectMapper().valueToTree(increment.fragments().get(0).component());
    List<JsonNode> islands = new ArrayList<>();
    collectByType(root, "ServerSide", islands);
    var island =
        islands.stream()
            .filter(node -> node.path("serverSideType").asText().contains("IslandView"))
            .findFirst()
            .orElseThrow();
    JsonNode initialData = island.path("initialData");
    assertThat(initialData.path("_embeddedMediator").asBoolean()).isTrue();
    assertThat(initialData.path("_inline").asBoolean()).isTrue();
    assertThat(initialData.path("stayId").asText()).isEqualTo("st-maria");
  }

  private static void collectByType(JsonNode node, String type, List<JsonNode> found) {
    if (node.isObject()) {
      if (type.equals(node.path("type").asText())) {
        found.add(node);
      }
      node.properties().forEach(entry -> collectByType(entry.getValue(), type, found));
    } else if (node.isArray()) {
      node.forEach(child -> collectByType(child, type, found));
    }
  }
}
