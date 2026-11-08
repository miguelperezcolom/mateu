package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.application.out.MateuHttpClient;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.AppDto;
import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.ComponentDto;
import io.mateu.dtos.MenuOptionDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UIFragmentDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.RemoteMenu;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import org.junit.jupiter.api.Test;

/**
 * A fresh deep link / reload of a REMOTE screen, as the Mateu Explorer's federated console does it
 * ({@code /fed/stock}, the Java remote at another ORIGIN whose app declares {@code /stock}). The
 * server's half: the shell answers itself with the remote screen mounted as its home — an ABSOLUTE
 * {@code homeBaseUrl}, the remote's type — under a non-root and under a root shell alike. (The
 * browser then has to load that home from that base, not from the shell's own:
 * appContentTarget.test.ts in libs/mateu.)
 */
class RemoteScreenDeepLinkSyncTest {

  static final String REMOTE = "http://inventory.example:8641/inventory";

  @SuppressWarnings("unused")
  @UI("/fed")
  @Title("Federated console")
  public static class NonRootShell {
    @Menu
    RemoteMenu inventory = new RemoteMenu(REMOTE).withLabel("Inventory").withPath("/inventory");
  }

  @SuppressWarnings("unused")
  @UI("")
  @Title("Root console")
  public static class RootShell {
    @Menu
    RemoteMenu inventory = new RemoteMenu(REMOTE).withLabel("Inventory").withPath("/inventory");
  }

  /** The remote app as the live Java remote answers it: mount /inventory, unprefixed routes. */
  public static class FakeInventory implements MateuHttpClient {
    @Override
    public CompletableFuture<UIIncrementDto> send(String baseUrl, RunActionRqDto request) {
      return send(baseUrl, request, null);
    }

    @Override
    public CompletableFuture<UIIncrementDto> send(
        String baseUrl, RunActionRqDto request, String authorization) {
      var appDto =
          AppDto.builder()
              .route("")
              .title("Inventory")
              .homeRoute("/stock")
              .homeConsumedRoute("")
              .homeBaseUrl("/inventory")
              .homeServerSideType("io.remote.InventoryApp")
              .menu(
                  List.of(
                      MenuOptionDto.builder().label("Stock").path("/stock").route("/stock").build(),
                      MenuOptionDto.builder()
                          .label("About")
                          .path("/about")
                          .route("/about")
                          .build()))
              .build();
      var component = new ClientSideComponentDto(appDto, "inventory", List.of(), null, null, null);
      return CompletableFuture.completedFuture(
          UIIncrementDto.builder()
              .fragments(List.of(UIFragmentDto.builder().component(component).build()))
              .build());
    }
  }

  private static AppDto shellApp(UIIncrementDto increment) {
    for (var fragment : increment.fragments()) {
      var found = findApp(fragment.component());
      if (found != null) return found;
    }
    return null;
  }

  private static AppDto findApp(ComponentDto component) {
    if (component instanceof ClientSideComponentDto cs) {
      if (cs.metadata() instanceof AppDto app) return app;
      for (var child : cs.children()) {
        var found = findApp(child);
        if (found != null) return found;
      }
    }
    return null;
  }

  private static AppDto freshDeepLink(TestMateu mateu, String baseUrl, String route) {
    return shellApp(
        mateu.runAt(
            baseUrl,
            RunActionRqDto.builder().route(route).consumedRoute("_empty").actionId("").build()));
  }

  @Test
  void underANonRootShellTheRemoteScreenIsMountedFromTheRemote() {
    try (var mateu = TestMateu.withUisAndBeans(List.of(new FakeInventory()), NonRootShell.class)) {
      var app = freshDeepLink(mateu, "/fed", "/stock");
      assertThat(app).isNotNull();
      assertThat(app.homeBaseUrl()).isEqualTo(REMOTE);
      assertThat(app.homeRoute()).isEqualTo("/stock");
      assertThat(app.homeServerSideType()).isEqualTo("io.remote.InventoryApp");
    }
  }

  @Test
  void underARootShellTheRemoteScreenIsMountedFromTheRemote() {
    try (var mateu = TestMateu.withUisAndBeans(List.of(new FakeInventory()), RootShell.class)) {
      var app = freshDeepLink(mateu, "", "/stock");
      assertThat(app).isNotNull();
      assertThat(app.homeBaseUrl()).isEqualTo(REMOTE);
      assertThat(app.homeRoute()).isEqualTo("/stock");
      assertThat(app.homeServerSideType()).isEqualTo("io.remote.InventoryApp");
    }
  }
}
