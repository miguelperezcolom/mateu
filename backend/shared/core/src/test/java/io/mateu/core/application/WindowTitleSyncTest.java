package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UICommandDto;
import io.mateu.dtos.UICommandTypeDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Data;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.State;
import io.mateu.uidl.data.UICommand;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

/**
 * The window title is the PAGE's title. Whatever else an action returns — state, data, messages,
 * commands, or a list mixing them — must never put its toString() in the browser tab (screen
 * readers announce every title change).
 */
class WindowTitleSyncTest {

  @SuppressWarnings("unused")
  @UI("/window-title")
  @Title("Bookings")
  public static class TitledPage {
    String name = "x";

    @Button
    Object state() {
      return new State(this);
    }

    @Button
    Object data() {
      return new Data(Map.of("a", 1));
    }

    @Button
    Object message() {
      return new Message("done");
    }

    @Button
    Object stateAndCommand() {
      return List.of(new State(this), UICommand.dispatchEvent("changed"));
    }

    @Button
    Object selfAndCommand() {
      return List.of(this, UICommand.dispatchEvent("changed"));
    }

    @Button
    Object messageAndData() {
      return List.of(new Message("done"), new Data(Map.of("a", 1)));
    }

    @Button
    Object self() {
      return this;
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(TitledPage.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  @ParameterizedTest
  @ValueSource(
      strings = {
        "state",
        "data",
        "message",
        "stateAndCommand",
        "selfAndCommand",
        "messageAndData",
        "self"
      })
  void anActionNeverTitlesTheWindowWithSomethingThatIsNotAPageTitle(String actionId) {
    var titles = titles(run(actionId));
    assertThat(titles).allSatisfy(t -> assertThat(t).isEqualTo("Bookings"));
  }

  private static List<String> titles(UIIncrementDto increment) {
    return increment.commands().stream()
        .filter(c -> c.type() == UICommandTypeDto.SetWindowTitle)
        .map(UICommandDto::data)
        .map(String::valueOf)
        .toList();
  }

  private static UIIncrementDto run(String actionId) {
    return mateu.run(
        RunActionRqDto.builder()
            .route("/window-title")
            .actionId(actionId)
            .serverSideType(TitledPage.class.getName())
            .initiatorComponentId("cmp-1")
            .componentState(Map.of("name", "x"))
            .parameters(Map.of())
            .build());
  }
}
