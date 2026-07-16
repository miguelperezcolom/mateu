package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.AppDto;
import io.mateu.dtos.AppHeaderActionDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.AppHeaderAction;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.interfaces.AppActionsSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * App header actions: the app class implements {@link AppActionsSupplier} and its actions render on
 * the header next to the @AppContext selectors. An action with children is a dropdown menu — only
 * the children dispatch. Dispatch is app-level (like the context selectors' remote search): the
 * frontend sends the app's serverSideType + the actionId, and the app class method with that name
 * runs even though no menu is actionable for the route.
 */
class AppHeaderActionsSyncTest {

  @SuppressWarnings("unused")
  @UI("/hdr")
  @Title("Header actions demo")
  public static class HeaderActionsApp implements AppActionsSupplier {

    @Menu String home = "/";

    @Override
    public List<AppHeaderAction> appActions(HttpRequest httpRequest) {
      return List.of(
          new AppHeaderAction("sync", "Sincronizar", "vaadin:refresh"),
          AppHeaderAction.menu(
              "Más",
              "vaadin:ellipsis-dots-v",
              List.of(
                  new AppHeaderAction("deploy", "Desplegar"),
                  new AppHeaderAction("purge", "Purgar caché"))));
    }

    public Message sync() {
      return new Message("synced");
    }

    public Message deploy() {
      return new Message("deployed");
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(HeaderActionsApp.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  @Test
  void headerActionsTravelOnTheAppMetadataWithTheirChildren() {
    var increment = mateu.sync("/hdr");
    var app =
        FullSyncPipelineTest.findMetadata(increment.fragments().get(0).component(), AppDto.class);
    assertThat(app).isNotNull();
    assertThat(app.contextActions())
        .extracting(AppHeaderActionDto::label)
        .containsExactly("Sincronizar", "Más");
    var plain = app.contextActions().get(0);
    assertThat(plain.actionId()).isEqualTo("sync");
    assertThat(plain.icon()).isEqualTo("vaadin:refresh");
    assertThat(plain.children()).isNull();
    var menu = app.contextActions().get(1);
    assertThat(menu.actionId()).isNull();
    assertThat(menu.children())
        .extracting(AppHeaderActionDto::actionId)
        .containsExactly("deploy", "purge");
  }

  @Test
  void aPlainHeaderActionDispatchesToTheAppClassMethod() {
    var increment =
        mateu.run(
            RunActionRqDto.builder()
                .route("/hdr")
                .serverSideType(HeaderActionsApp.class.getName())
                .actionId("sync")
                .initiatorComponentId("app-header-action")
                .componentState(Map.of())
                .build());
    assertThat(increment.messages()).extracting(m -> m.text()).contains("synced");
  }

  @Test
  void aDropdownChildActionDispatchesEvenThoughOnlyTheMenuIsTopLevel() {
    var increment =
        mateu.run(
            RunActionRqDto.builder()
                .route("/hdr")
                .serverSideType(HeaderActionsApp.class.getName())
                .actionId("deploy")
                .initiatorComponentId("app-header-action")
                .componentState(Map.of())
                .build());
    assertThat(increment.messages()).extracting(m -> m.text()).contains("deployed");
  }
}
