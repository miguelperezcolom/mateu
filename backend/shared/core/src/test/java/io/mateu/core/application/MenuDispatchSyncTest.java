package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.application.out.MateuHttpClient;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.RemoteMenu;
import io.mateu.uidl.interfaces.Actionable;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.MenuSupplier;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * Menu-option dispatch through the typed app-resolution path (field links resolved by
 * ActionableDispatcher) and remote menus fetched through the MateuHttpClient port (faked here,
 * primary over the scanned default).
 */
class MenuDispatchSyncTest {

  @SuppressWarnings("unused")
  public static class ReportsPage {
    String period = "monthly";
  }

  @SuppressWarnings("unused")
  public static class RemoteMenus implements MenuSupplier {
    @Override
    public List<Actionable> menu(HttpRequest httpRequest) {
      return List.of(
          new RemoteMenu(
              "http://remote.example",
              "/remote-root",
              "",
              null,
              Map.of(),
              false,
              "Remote app",
              "/remote"));
    }
  }

  @SuppressWarnings("unused")
  @UI("/hub")
  @Title("Hub")
  public static class HubApp {
    @Menu ReportsPage reports = new ReportsPage();

    @Menu RemoteMenus external = new RemoteMenus();
  }

  /** Canned remote backend: answers every request with a minimal App increment. */
  public static class FakeHttpClient implements MateuHttpClient {
    static int calls;

    @Override
    public CompletableFuture<UIIncrementDto> send(String baseUrl, RunActionRqDto request) {
      calls++;
      return CompletableFuture.completedFuture(
          UIIncrementDto.builder().fragments(List.of()).commands(List.of()).build());
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUisAndBeans(List.of(new FakeHttpClient()), HubApp.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  @Test
  void fieldMenuOptionsDispatchThroughTheTypedAppPath() {
    var increment =
        mateu.run(
            RunActionRqDto.builder()
                .route("/hub/reports")
                .consumedRoute("/hub")
                .serverSideType(HubApp.class.getName())
                .actionId("")
                .initiatorComponentId("hub_app")
                .build());
    assertThat(increment.fragments()).isNotEmpty();
  }

  @Test
  void remoteMenuRoutesStillProduceAnIncrement() {
    // The remote-app FETCH belongs to the frontend (completeMenu); server-side the route just
    // resolves within the hub app without calling the HTTP port.
    var increment = mateu.sync("/hub/remote");
    assertThat(increment).isNotNull();
  }
}
