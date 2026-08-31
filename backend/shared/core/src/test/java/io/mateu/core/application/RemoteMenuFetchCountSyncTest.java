package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.application.out.MateuHttpClient;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.AppDto;
import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.MenuOptionDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UIFragmentDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.RemoteMenu;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/**
 * How many times a shell asks its remotes for their app descriptor in order to paint one page.
 *
 * <p>This is a measurement, not a preference. Each of those calls is an HTTP round trip to the
 * remote's home route, so the remote renders its home just to answer "here is my menu" — on the
 * reference deployment that hop took 777 ms to return 418 bytes.
 */
class RemoteMenuFetchCountSyncTest {

  static final List<String> CALLS = new ArrayList<>();

  @SuppressWarnings("unused")
  @UI("")
  @Title("Console")
  public static class ShellRoot {
    @Menu
    RemoteMenu booking = new RemoteMenu("/_booking").withLabel("Booking").withPath("/booking");

    @Menu
    RemoteMenu content = new RemoteMenu("/_content").withLabel("Content").withPath("/content");

    @Menu
    RemoteMenu workflow = new RemoteMenu("/_workflow").withLabel("Workflow").withPath("/workflow");
  }

  /** Every remote answers with its own two menu routes, unprefixed. */
  public static class CountingRemotes implements MateuHttpClient {
    @Override
    public CompletableFuture<UIIncrementDto> send(String baseUrl, RunActionRqDto request) {
      return send(baseUrl, request, null);
    }

    @Override
    public CompletableFuture<UIIncrementDto> send(
        String baseUrl, RunActionRqDto request, String authorization) {
      CALLS.add(baseUrl);
      var name = baseUrl.replace("/_", "");
      var appDto =
          AppDto.builder()
              .route("")
              .title(name)
              .homeRoute("_no_home_route")
              .homeConsumedRoute("")
              .homeServerSideType(name + ".Home")
              .menu(
                  List.of(
                      MenuOptionDto.builder()
                          .label("Processes")
                          .path("/processes")
                          .route("/processes")
                          .build(),
                      MenuOptionDto.builder()
                          .label("Definitions")
                          .path("/definitions")
                          .route("/definitions")
                          .build()))
              .build();
      var component =
          new ClientSideComponentDto(appDto, name + "_app", List.of(), null, null, null);
      return CompletableFuture.completedFuture(
          UIIncrementDto.builder()
              .fragments(List.of(UIFragmentDto.builder().component(component).build()))
              .build());
    }
  }

  static TestMateu mateu;
  final java.util.concurrent.atomic.AtomicLong clock = new java.util.concurrent.atomic.AtomicLong();

  @BeforeEach
  void boot() {
    CALLS.clear();
    mateu = TestMateu.withUisAndBeans(List.of(new CountingRemotes()), ShellRoot.class);
  }

  @AfterEach
  void shutdown() {
    mateu.close();
  }

  private void viaUrl(String route) {
    mateu.run(RunActionRqDto.builder().route(route).consumedRoute("_empty").actionId("").build());
  }

  @Test
  void oneNavigationAsksTheRemoteOnce() {
    viaUrl("/workflow/processes");

    assertThat(CALLS).containsExactly("null/_workflow");
  }

  /**
   * The measurement this exists for. Every click within one remote used to be its own round trip to
   * that remote's home; the descriptor changes when the remote is redeployed and at no other time.
   */
  @Test
  void navigatingWithinOneRemoteDoesNotAskItAgain() {
    viaUrl("/workflow/processes");
    viaUrl("/workflow/definitions");
    viaUrl("/workflow/processes");

    assertThat(CALLS).containsExactly("null/_workflow");
  }

  /** Each remote is still its own entry — one answer must never stand in for another's. */
  @Test
  void eachRemoteIsAskedForItself() {
    viaUrl("/workflow/processes");
    viaUrl("/booking/processes");

    assertThat(CALLS).containsExactly("null/_workflow", "null/_booking");
  }
}
