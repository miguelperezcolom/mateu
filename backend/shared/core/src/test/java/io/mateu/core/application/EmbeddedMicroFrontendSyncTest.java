package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.JsonNode;
import io.mateu.core.infra.WireMapper;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UICommandDto;
import io.mateu.dtos.UICommandTypeDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.Toolbar;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.EmbeddedChrome;
import io.mateu.uidl.data.MicroFrontend;
import io.mateu.uidl.data.UICommand;
import io.mateu.uidl.data.UICommandType;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.CommandSupplier;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * A micro frontend EMBEDDED in a page ({@code MicroFrontend.chrome}) is a block of that page, not a
 * page of its own: its chrome travels on the wire, every request it sends says so ({@code
 * embeddedChrome}), and the server answering such a request sends no window commands — the title,
 * the history push and the favicon belong to the host page (in ec-demo1 the remote's title won over
 * the host's on every load).
 */
class EmbeddedMicroFrontendSyncTest {

  static final List<UICommandTypeDto> WINDOW =
      List.of(
          UICommandTypeDto.SetWindowTitle,
          UICommandTypeDto.SetFavicon,
          UICommandTypeDto.PushStateToHistory);

  /** The remote screen: names the window, sets a favicon and pushes history on every load. */
  @UI("/remote-tools")
  @Title("Remote tools")
  public static class RemoteTools implements CommandSupplier {
    String name = "n";

    @Override
    public List<UICommand> commands(HttpRequest httpRequest) {
      return List.of(
          new UICommand(UICommandType.SetFavicon, "/remote.png"),
          new UICommand(UICommandType.PushStateToHistory, "/remote-tools/somewhere"),
          new UICommand(UICommandType.DispatchEvent, "remote-loaded"));
    }

    @Toolbar
    public List<Object> rename() {
      return List.of(
          new UICommand(UICommandType.SetWindowTitle, "Renamed by the remote"),
          new UICommand(UICommandType.PushStateToHistory, "/remote-tools/edit"),
          new UICommand(UICommandType.DispatchEvent, "renamed"));
    }
  }

  /** The host page: one block per chrome, and a top-level one. */
  @UI("/host-tools")
  @Title("Herramientas")
  public static class HostTools implements ComponentTreeSupplier {
    @Override
    public Component component(HttpRequest httpRequest) {
      var parts = new ArrayList<Component>();
      parts.add(
          MicroFrontend.builder().baseUrl("/remote").route("/remote-tools").build()); // top-level
      for (var chrome : EmbeddedChrome.values()) {
        parts.add(
            MicroFrontend.builder()
                .baseUrl("/remote")
                .route("/remote-tools")
                .actionId(chrome.name())
                .chrome(chrome)
                .build());
      }
      return new VerticalLayout(parts);
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(RemoteTools.class, HostTools.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  static List<UICommandTypeDto> typesOf(UIIncrementDto increment) {
    return increment.commands().stream().map(UICommandDto::type).toList();
  }

  static UIIncrementDto load(String chrome) {
    return mateu.run(
        RunActionRqDto.builder()
            .route("/remote-tools")
            .actionId("")
            .initiatorComponentId("mfe_1")
            .embeddedChrome(chrome)
            .build());
  }

  @Test
  void aTopLevelLoadStillNamesTheWindowAndMovesTheHistory() {
    var types = typesOf(load(null));
    assertThat(types)
        .contains(
            UICommandTypeDto.SetWindowTitle,
            UICommandTypeDto.SetFavicon,
            UICommandTypeDto.PushStateToHistory,
            UICommandTypeDto.DispatchEvent);
  }

  @Test
  void anEmbeddedLoadSendsNoWindowCommandsWhateverTheChrome() {
    for (var chrome : EmbeddedChrome.values()) {
      var types = typesOf(load(chrome.name()));
      assertThat(types).as(chrome.name()).doesNotContainAnyElementsOf(WINDOW);
      // everything else still travels: it is the island's behaviour, not the window's
      assertThat(types).as(chrome.name()).contains(UICommandTypeDto.DispatchEvent);
    }
  }

  @Test
  void anEmbeddedActionSendsNoWindowCommandsEither() {
    var rq =
        RunActionRqDto.builder()
            .route("/remote-tools")
            .consumedRoute("/remote-tools")
            .actionId("rename")
            .serverSideType(RemoteTools.class.getName())
            .initiatorComponentId("mfe_1")
            .componentState(Map.of("name", "n"));
    assertThat(typesOf(mateu.run(rq.build())))
        .contains(UICommandTypeDto.SetWindowTitle, UICommandTypeDto.PushStateToHistory);

    var embedded = typesOf(mateu.run(rq.embeddedChrome("COMPACT").build()));
    assertThat(embedded).doesNotContainAnyElementsOf(WINDOW);
    assertThat(embedded).contains(UICommandTypeDto.DispatchEvent);
  }

  @Test
  void theHostPageKeepsNamingTheWindow() {
    // the host's own load is top-level: its title is the one that sticks
    var host = mateu.sync("/host-tools");
    assertThat(host.commands())
        .filteredOn(c -> c.type() == UICommandTypeDto.SetWindowTitle)
        .extracting(UICommandDto::data)
        .contains("Herramientas");
  }

  @Test
  void theChromeTravelsOnTheWireOnlyWhenSet() throws Exception {
    var host = mateu.sync("/host-tools");
    var microFrontends = new ArrayList<JsonNode>();
    collect(WireMapper.shared().valueToTree(host), microFrontends);
    assertThat(microFrontends)
        .extracting(node -> node.has("chrome") ? node.get("chrome").asText() : null)
        .containsExactly(null, "NONE", "COMPACT", "PAGE");

    // the top-level one keeps the shape it always had: no chrome key at all
    var json = WireMapper.shared().writeValueAsString(host);
    assertThat(json.split("\"chrome\"", -1)).hasSize(EmbeddedChrome.values().length + 1);
  }

  @Test
  void anOlderRequestWithoutTheMarkerIsTopLevel() throws Exception {
    var rq =
        WireMapper.shared()
            .readValue("{\"route\":\"/remote-tools\",\"actionId\":\"\"}", RunActionRqDto.class);
    assertThat(rq.embedded()).isFalse();
    var marked =
        WireMapper.shared()
            .readValue(
                "{\"route\":\"/remote-tools\",\"actionId\":\"\",\"embeddedChrome\":\"NONE\"}",
                RunActionRqDto.class);
    assertThat(marked.embedded()).isTrue();
    assertThat(marked.embeddedChrome()).isEqualTo("NONE");
  }

  private static void collect(JsonNode node, List<JsonNode> out) {
    if (node == null) return;
    if (node.isObject()) {
      if ("MicroFrontend".equals(node.path("type").asText())) {
        out.add(node);
        return;
      }
      for (var it = node.fields(); it.hasNext(); ) collect(it.next().getValue(), out);
    } else if (node.isArray()) {
      for (var child : node) collect(child, out);
    }
  }
}
