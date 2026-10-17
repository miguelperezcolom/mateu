package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.ActionDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.ServerSideComponentDto;
import io.mateu.uidl.annotations.Fab;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Message;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * A page {@code @Fab} dispatches its method like a button, and the web client only SENDS an action
 * its component advertises. The FAB was never advertised, so clicking it did nothing in the browser
 * (the API-level e2e tests that call the action directly could not notice).
 */
class PageFabSyncTest {

  @UI("/page-fab")
  @Title("Fab page")
  public static class FabPage {
    public String name = "Ada";

    @Fab(icon = "vaadin:plus", label = "Add")
    public Message add() {
      return new Message("Added");
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(FabPage.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  @Test
  void aPageFabIsAdvertisedWithoutClientValidation() {
    var component = (ServerSideComponentDto) mateu.sync("/page-fab").fragments().get(0).component();
    var fab = component.actions().stream().filter(a -> a.id().equals("add")).findFirst();
    assertThat(fab).as("the FAB's action is advertised").isPresent();
    assertThat(fab.map(ActionDto::validationRequired)).contains(false);
  }

  @Test
  void theAdvertisedFabRuns() {
    var increment =
        mateu.run(
            RunActionRqDto.builder()
                .route("/page-fab")
                .consumedRoute("/page-fab")
                .serverSideType(FabPage.class.getName())
                .actionId("add")
                .build());
    assertThat(increment.messages()).extracting(m -> m.text()).contains("Added");
  }
}
