package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.ContextMenu;
import io.mateu.uidl.data.Directory;
import io.mateu.uidl.data.Menu;
import io.mateu.uidl.data.MethodLink;
import io.mateu.uidl.data.RouteLink;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.fluent.MenuBar;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * The menus a page carries in its CONTENT — MenuBar, ContextMenu, Directory. Their options are
 * Actionables, and an option the user picks must say where it goes: a RouteLink its route, a
 * MethodLink the action it runs. The mapper used to send only a `path` made from the label, so
 * picking an item could do nothing (found building the Mateu Explorer, 3.0-beta.51).
 */
class ContentMenusSyncTest {

  private static final ObjectMapper JSON =
      new ObjectMapper()
          .registerModule(new JavaTimeModule())
          .disable(SerializationFeature.FAIL_ON_EMPTY_BEANS);

  @UI("/content-menus-host")
  public static class Host {}

  @UI("/content-menus-fluent")
  public static class FluentMenus implements ComponentTreeSupplier {
    @Override
    public Component component(HttpRequest httpRequest) {
      var kanban = RouteLink.builder().label("Kanban").route("/components/kanban").build();
      var refresh = MethodLink.builder().label("Refresh").methodName("refresh").build();
      return VerticalLayout.builder()
          .content(
              List.of(
                  MenuBar.builder()
                      .option(Menu.builder().label("Go").submenu(List.of(kanban, refresh)).build())
                      .build(),
                  ContextMenu.builder()
                      .menu(List.of(kanban))
                      .wrapped(new Text("right click me"))
                      .build(),
                  Directory.builder()
                      .menu(
                          List.of(
                              Menu.builder().label("Visualise").submenu(List.of(kanban)).build()))
                      .build()))
          .build();
    }

    public void refresh() {}
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(Host.class, FluentMenus.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private static List<JsonNode> optionsLabelled(JsonNode node, String label) {
    var found = new ArrayList<JsonNode>();
    collect(node, label, found);
    return found;
  }

  private static void collect(JsonNode node, String label, List<JsonNode> found) {
    if (node == null) return;
    if (node.isObject()) {
      if (label.equals(node.path("label").asText()) && node.has("submenus")) found.add(node);
      node.elements().forEachRemaining(child -> collect(child, label, found));
    } else if (node.isArray()) {
      node.elements().forEachRemaining(child -> collect(child, label, found));
    }
  }

  @Test
  void aRouteLinkInAContentMenuCarriesItsRouteInEveryMenuComponent() {
    JsonNode wire = JSON.valueToTree(mateu.sync("/content-menus-fluent"));
    var kanban = optionsLabelled(wire, "Kanban");
    // MenuBar, ContextMenu and Directory
    assertThat(kanban).hasSize(3);
    assertThat(kanban)
        .allSatisfy(o -> assertThat(o.path("route").asText()).isEqualTo("/components/kanban"));
    assertThat(kanban).allSatisfy(o -> assertThat(o.path("submenus").size()).isZero());
  }

  @Test
  void aMethodLinkInAContentMenuRunsItsMethod() {
    JsonNode wire = JSON.valueToTree(mateu.sync("/content-menus-fluent"));
    var refresh = optionsLabelled(wire, "Refresh");
    assertThat(refresh).hasSize(1);
    assertThat(refresh.get(0).path("actionId").asText()).isEqualTo("refresh");
  }

  @Test
  void aYamlRouteLinkKeepsItsRoute() {
    var rq =
        RunActionRqDto.builder()
            .route("/content-menus-host")
            .consumedRoute("")
            .actionId("__preview__")
            .initiatorComponentId("content")
            .componentState(Map.of())
            .parameters(
                Map.of(
                    "_yaml",
                    """
                    type: MenuBar
                    options:
                      - {type: RouteLink, label: Home, route: /home}
                    """))
            .build();
    JsonNode wire = JSON.valueToTree(mateu.run(rq));
    assertThat(optionsLabelled(wire, "Home").get(0).path("route").asText()).isEqualTo("/home");
  }
}
