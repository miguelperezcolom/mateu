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
import io.mateu.uidl.annotations.Hidden;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.RemoteMenu;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/**
 * A remote section with no menu entry: {@code @Menu @Hidden RemoteMenu}. Real case: the demo
 * console reaches its inbox from a header widget, so an "Inbox" entry on the bar only repeated it —
 * but taking the entry away took the deep links with it, because the shell resolves a reloaded or
 * bookmarked route by offering it to the remotes of its menu. Hidden keeps the remote in the menu
 * the shell resolves against and marks it invisible on the wire, so the renderer leaves it out of
 * the menu it draws.
 */
class RemoteMenuHiddenDeepLinkSyncTest {

  @SuppressWarnings("unused")
  @UI("")
  @Title("Demo Console")
  public static class ShellRoot {
    @Menu RemoteMenu booking = new RemoteMenu("/_booking");

    // reached from a header widget: resolves deep links, draws no entry
    @Menu @Hidden RemoteMenu inbox = new RemoteMenu("/_inbox");
  }

  /** A remote that declares its routes WITH the /inbox prefix (like the demo's inbox service). */
  public static class FakeInbox implements MateuHttpClient {
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
              .title("Inbox")
              .homeRoute("_no_home_route")
              .homeConsumedRoute("")
              .homeServerSideType("demo.InboxHome")
              .menu(
                  List.of(
                      MenuOptionDto.builder()
                          .label("Inbox")
                          .path("/inbox")
                          .route("/inbox")
                          .submenus(
                              List.of(
                                  MenuOptionDto.builder()
                                      .label("Pending")
                                      .path("/inbox/pending")
                                      .route("/inbox/pending")
                                      .build()))
                          .build()))
              .build();
      var component = new ClientSideComponentDto(appDto, "inbox_app", List.of(), null, null, null);
      var fragment = UIFragmentDto.builder().component(component).build();
      return CompletableFuture.completedFuture(
          UIIncrementDto.builder().fragments(List.of(fragment)).build());
    }
  }

  static TestMateu mateu;

  @BeforeEach
  void boot() {
    mateu = TestMateu.withUisAndBeans(List.of(new FakeInbox()), ShellRoot.class);
  }

  @AfterEach
  void shutdown() {
    mateu.close();
  }

  private static AppDto shellApp(UIIncrementDto increment) {
    for (var fragment : increment.fragments()) {
      var found = findApp(fragment.component());
      if (found != null) {
        return found;
      }
    }
    return null;
  }

  private static AppDto findApp(ComponentDto component) {
    if (component instanceof ClientSideComponentDto cs) {
      if (cs.metadata() instanceof AppDto app) {
        return app;
      }
      for (var child : cs.children()) {
        var found = findApp(child);
        if (found != null) {
          return found;
        }
      }
    }
    return null;
  }

  private UIIncrementDto viaUrl(String route) {
    return mateu.run(
        RunActionRqDto.builder().route(route).consumedRoute("_empty").actionId("").build());
  }

  private static MenuOptionDto option(AppDto app, String path) {
    return app.menu().stream().filter(o -> path.equals(o.path())).findFirst().orElse(null);
  }

  @Test
  void aHiddenRemoteTravelsInvisibleAndAVisibleOneStaysVisible() {
    var app = shellApp(viaUrl(""));
    assertThat(app).isNotNull();
    assertThat(option(app, "/inbox")).isNotNull();
    assertThat(option(app, "/inbox").remote()).isTrue();
    assertThat(option(app, "/inbox").visible()).isFalse();
    assertThat(option(app, "/booking").visible()).isTrue();
  }

  @Test
  void aDeepLinkUnderAHiddenRemoteMountsTheRemote() {
    var app = shellApp(viaUrl("/inbox/pending"));
    assertThat(app).isNotNull();
    assertThat(app.homeBaseUrl()).isEqualTo("/_inbox");
    assertThat(app.homeRoute()).isEqualTo("/inbox/pending");
  }

  @Test
  void aRecordDeepLinkUnderAHiddenRemoteMountsTheRemote() {
    var app = shellApp(viaUrl("/inbox/pending/n-7"));
    assertThat(app).isNotNull();
    assertThat(app.homeBaseUrl()).isEqualTo("/_inbox");
    assertThat(app.homeRoute()).isEqualTo("/inbox/pending/n-7");
  }

  @Test
  void theFluentFormHidesItToo() {
    var hidden = new RemoteMenu("/_inbox").withHidden(true);
    assertThat(hidden.hidden()).isTrue();
    assertThat(new RemoteMenu("/_inbox").hidden()).isFalse();
  }
}
