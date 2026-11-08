package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.core.testutil.WireWalk;
import io.mateu.dtos.ActionDto;
import io.mateu.dtos.ButtonDto;
import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.ServerSideComponentDto;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.ButtonGroup;
import io.mateu.uidl.data.State;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * A {@link ButtonGroup} in a content tree (not a toolbar) reaches the wire as a content Button
 * whose {@code children} are the group's buttons — the shape a toolbar group already had. Before,
 * the content dispatcher had no branch for it and the group vanished without a trace (found by the
 * Mateu Explorer's Button &amp; ButtonGroup entry).
 */
class ButtonGroupInContentSyncTest {

  @UI("/button-group-in-content")
  public static class GroupPage implements ComponentTreeSupplier {

    int archived = 0;

    @Override
    public Component component(HttpRequest httpRequest) {
      return new VerticalLayout(
          new Text("A group in the content"),
          ButtonGroup.builder()
              .id("more")
              .label("More")
              .iconOnLeft("vaadin:ellipsis-dots-h")
              .buttons(
                  List.of(
                      new Button("Export", "export"),
                      new Button(
                          "Archive",
                          () -> {
                            archived++;
                            return new State(this);
                          })))
              .build());
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(GroupPage.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  @Test
  void theGroupTravelsAsAContentButtonWithItsButtonsAsChildren() {
    var increment = mateu.sync("/button-group-in-content");
    var group =
        WireWalk.all(increment, ClientSideComponentDto.class).stream()
            .filter(c -> "more".equals(c.id()))
            .findFirst()
            .orElseThrow(() -> new AssertionError("the ButtonGroup was dropped from the content"));
    var metadata = (ButtonDto) group.metadata();
    assertThat(metadata.label()).isEqualTo("More");
    assertThat(metadata.iconOnLeft()).isEqualTo("vaadin:ellipsis-dots-h");
    assertThat(metadata.children())
        .extracting(ButtonDto::actionId)
        .containsExactly("export", "archive");
  }

  @Test
  void aHandlerButtonInsideTheGroupIsAdvertisedAndRuns() {
    var increment = mateu.sync("/button-group-in-content");
    var component = (ServerSideComponentDto) increment.fragments().get(0).component();
    assertThat(component.actions().stream().map(ActionDto::id)).contains("archive");
    var result =
        mateu.run(
            RunActionRqDto.builder()
                .route("/button-group-in-content")
                .actionId("archive")
                .serverSideType(component.serverSideType())
                .componentState(Map.of("archived", 2))
                .build());
    @SuppressWarnings("unchecked")
    var state = (Map<String, Object>) result.fragments().get(0).state();
    assertThat(state.get("archived")).isEqualTo(3);
  }
}
