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
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/**
 * Deep-link into a remote whose own menu REPEATS the shell's segment: the shell mounts {@code
 * RemoteMenu("/_partners")} under the menu path {@code /partners} (the field name), and the remote
 * declares a group {@code /partners} holding the listing {@code /partners/partners}.
 *
 * <p>Real case: ec-demo1's data plane, ERP → Partners. Through the menu the URL became {@code
 * /partners/partners} and the listing opened; reloading that URL opened the ERP section index
 * instead. The remote claims both candidate routes — the stripped {@code /partners} (its group) and
 * the verbatim {@code /partners/partners} (the screen) — and the stripped one was taken first, so
 * the remote was asked for {@code route=/partners}. The more specific claim must win.
 */
class RemoteMenuRepeatedSegmentDeepLinkSyncTest {

  @SuppressWarnings("unused")
  @UI("")
  @Title("Data plane")
  public static class ShellRoot {
    @Menu RemoteMenu partners = new RemoteMenu("/_partners");
  }

  /** A remote whose group repeats the shell's menu path: /partners → /partners/partners. */
  public static class FakePartners implements MateuHttpClient {
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
              .title("Partners")
              .homeRoute("_no_home_route")
              .homeConsumedRoute("")
              .homeServerSideType("io.mateu.ecdemo1.partners.infra.in.ui.PartnersHome")
              .menu(
                  List.of(
                      MenuOptionDto.builder()
                          .label("ERP")
                          .path("/partners")
                          .route("/partners")
                          .submenus(
                              List.of(
                                  MenuOptionDto.builder()
                                      .label("Partners")
                                      .path("/partners/partners")
                                      .route("/partners/partners")
                                      .build()))
                          .build()))
              .build();
      var component =
          new ClientSideComponentDto(appDto, "partners_app", List.of(), null, null, null);
      var fragment = UIFragmentDto.builder().component(component).build();
      return CompletableFuture.completedFuture(
          UIIncrementDto.builder().fragments(List.of(fragment)).build());
    }
  }

  static TestMateu mateu;

  @BeforeEach
  void boot() {
    mateu = TestMateu.withUisAndBeans(List.of(new FakePartners()), ShellRoot.class);
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

  @Test
  void deepLinkToTheScreenReachesTheScreenNotTheGroup() {
    var app = shellApp(viaUrl("/partners/partners"));
    assertThat(app).isNotNull();
    assertThat(app.homeBaseUrl()).isEqualTo("/_partners");
    // NOT "/partners": that is the remote's GROUP (a section index), which the stripped route also
    // matches. The menu sends "/partners/partners", and so must the deep link.
    assertThat(app.homeRoute()).isEqualTo("/partners/partners");
  }

  @Test
  void deepLinkToARecordOfTheScreenKeepsBothSegments() {
    var app = shellApp(viaUrl("/partners/partners/p-42"));
    assertThat(app).isNotNull();
    assertThat(app.homeRoute()).isEqualTo("/partners/partners/p-42");
  }

  @Test
  void rootDeepLinkStillMountsTheMenuPathAsHomeContent() {
    var app = shellApp(viaUrl("/partners"));
    assertThat(app).isNotNull();
    assertThat(app.homeBaseUrl()).isEqualTo("/_partners");
    assertThat(app.homeRoute()).isEqualTo("/partners");
    assertThat(app.homeConsumedRoute()).isEqualTo("/partners");
  }
}
