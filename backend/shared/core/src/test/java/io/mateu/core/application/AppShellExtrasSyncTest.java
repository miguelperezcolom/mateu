package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.AppDto;
import io.mateu.dtos.HeaderValueDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UICommandTypeDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.LiveHeaderValues;
import io.mateu.uidl.annotations.App;
import io.mateu.uidl.annotations.AppShortcut;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.HeaderValue;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.UICommand;
import io.mateu.uidl.interfaces.HeaderValuesSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.KeepAliveHandler;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * The app-shell side of the E2 patterns, each opt-in:
 *
 * <ul>
 *   <li>app-wide shortcuts and quick-launch codes ({@code @AppShortcut}), routes made absolute like
 *       the menu's, an action shortcut dispatched to the app;
 *   <li>live header values ({@link HeaderValuesSupplier}), the {@code UpdateHeaderValue} command,
 *       and the {@code _live-updates} event stream fed by {@link LiveHeaderValues#publish};
 *   <li>the idle-session warning ({@code @App(idleTimeoutMinutes)}) and its {@code _keep-alive}.
 * </ul>
 */
class AppShellExtrasSyncTest {

  static final AtomicInteger keepAlives = new AtomicInteger();

  @SuppressWarnings("unused")
  @UI("/e2-plain")
  @Title("Plain")
  @App
  public static class PlainApp {
    @Menu String home = "/";
  }

  @SuppressWarnings("unused")
  @UI("/e2")
  @Title("Front desk")
  @App(liveUpdates = true, idleTimeoutMinutes = 20, idleWarningSeconds = 45)
  @AppShortcut(key = "F9", route = "/reservations", label = "Reservations", code = "RES")
  @AppShortcut(key = "alt+g", route = "/guests")
  @AppShortcut(code = "SYNC", actionId = "syncNow", label = "Sync now")
  @AppShortcut(label = "nothing to press") // neither key nor code: dropped
  public static class FrontDesk implements HeaderValuesSupplier, KeepAliveHandler {
    @Menu String reservations = "/reservations";

    @Override
    public List<HeaderValue> headerValues(HttpRequest httpRequest) {
      return List.of(
          new HeaderValue("businessDate", "Business date", "12 Oct 2026"),
          new HeaderValue("shift", null, "Night"));
    }

    @Override
    public void keepAlive(HttpRequest httpRequest) {
      keepAlives.incrementAndGet();
    }

    public Message syncNow() {
      return new Message("synced");
    }

    @io.mateu.uidl.annotations.Action // nothing advertises it: the test dispatches it
    public UICommand closeDay() {
      return UICommand.updateHeaderValue("businessDate", "13 Oct 2026");
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    LiveHeaderValues.reset();
    mateu = TestMateu.withUis(PlainApp.class, FrontDesk.class);
  }

  @AfterAll
  static void shutdown() {
    LiveHeaderValues.reset();
    mateu.close();
  }

  private AppDto app(String route) {
    return FullSyncPipelineTest.findMetadata(
        mateu.sync(route).fragments().get(0).component(), AppDto.class);
  }

  @Test
  void everythingIsOffByDefault() {
    var app = app("/e2-plain");
    assertThat(app.shortcuts()).isEmpty();
    assertThat(app.headerValues()).isEmpty();
    assertThat(app.liveUpdates()).isFalse();
    assertThat(app.idleSession()).isNull();
  }

  @Test
  void appShortcutsTravelWithAbsoluteRoutesAndLabels() {
    var shortcuts = app("/e2").shortcuts();
    assertThat(shortcuts).hasSize(3);
    var f9 = shortcuts.get(0);
    assertThat(f9.key()).isEqualTo("f9");
    assertThat(f9.route()).isEqualTo("/e2/reservations");
    assertThat(f9.label()).isEqualTo("Reservations");
    assertThat(f9.code()).isEqualTo("RES");
    // a missing label is the route's last segment humanized
    assertThat(shortcuts.get(1).label()).isEqualTo("Guests");
    assertThat(shortcuts.get(2).actionId()).isEqualTo("syncNow");
    assertThat(shortcuts.get(2).route()).isNull();
  }

  @Test
  void anActionShortcutRunsOnTheApp() {
    var increment =
        mateu.run(
            RunActionRqDto.builder()
                .route("/e2")
                .serverSideType(FrontDesk.class.getName())
                .actionId("syncNow")
                .initiatorComponentId("app-shortcut")
                .componentState(Map.of())
                .build());
    assertThat(increment.messages()).extracting(m -> m.text()).contains("synced");
  }

  /**
   * A route load has actionId "" and most shortcuts have no actionId either: the two blanks must
   * not make the load "app-level" (every page of such an app came up blank on Redwood).
   */
  @Test
  void aBlankActionIdIsNeverAnAppShortcutAction() {
    assertThat(
            io.mateu.core.application.runaction.ActionInstanceCreatorAccess.isAppShortcutAction(
                FrontDesk.class, ""))
        .isFalse();
    assertThat(
            io.mateu.core.application.runaction.ActionInstanceCreatorAccess.isAppShortcutAction(
                FrontDesk.class, "syncNow"))
        .isTrue();
  }

  @Test
  void headerValuesComeFromTheSupplier() {
    assertThat(app("/e2").headerValues())
        .containsExactly(
            new HeaderValueDto("businessDate", "Business date", "12 Oct 2026"),
            new HeaderValueDto("shift", null, "Night"));
  }

  @Test
  void anActionChangesAHeaderValueWithACommand() {
    var increment =
        mateu.run(
            RunActionRqDto.builder()
                .route("/e2")
                .serverSideType(FrontDesk.class.getName())
                .actionId("closeDay")
                .initiatorComponentId("x")
                .componentState(Map.of())
                .build());
    var command =
        increment.commands().stream()
            .filter(c -> c.type() == UICommandTypeDto.UpdateHeaderValue)
            .findFirst()
            .orElseThrow();
    var value = (HeaderValue) command.data();
    assertThat(value.id()).isEqualTo("businessDate");
    assertThat(value.value()).isEqualTo("13 Oct 2026");
  }

  @Test
  void theEventStreamCatchesUpAndCarriesEveryPublish() {
    LiveHeaderValues.publish("shift", "Morning");
    var rq =
        RunActionRqDto.builder()
            .route("/e2")
            .serverSideType(FrontDesk.class.getName())
            .actionId("_live-updates")
            .initiatorComponentId("live")
            .componentState(Map.of())
            .build();
    var received = new java.util.concurrent.CopyOnWriteArrayList<UIIncrementDto>();
    var subscription = mateu.stream(rq).subscribe(received::add);
    try {
      await(() -> received.size() >= 1);
      // first increment: what was published before this browser connected
      assertThat(headerUpdates(received.get(0)))
          .containsExactly(new HeaderValueDto("shift", null, "Morning"));
      LiveHeaderValues.publish("businessDate", "13 Oct 2026");
      await(() -> received.size() >= 2);
      assertThat(headerUpdates(received.get(1)))
          .containsExactly(new HeaderValueDto("businessDate", null, "13 Oct 2026"));
    } finally {
      subscription.dispose();
    }
    // a shell built AFTER the publish starts from the published value, label kept
    assertThat(app("/e2").headerValues())
        .contains(new HeaderValueDto("businessDate", "Business date", "13 Oct 2026"));
    LiveHeaderValues.reset();
  }

  @Test
  void theIdleWarningIsConfiguredInSecondsWithTheKeepAliveAction() {
    var idle = app("/e2").idleSession();
    assertThat(idle.timeoutSeconds()).isEqualTo(20 * 60);
    assertThat(idle.warningSeconds()).isEqualTo(45);
    assertThat(idle.keepAliveActionId()).isEqualTo("_keep-alive");
    // no sign-out url declared: back to the app's own route
    assertThat(idle.signOutUrl()).isNotBlank();
    assertThat(app("/e2").liveUpdates()).isTrue();
  }

  @Test
  void keepAliveReachesTheAppsHandler() {
    var before = keepAlives.get();
    mateu.run(
        RunActionRqDto.builder()
            .route("/e2")
            .serverSideType(FrontDesk.class.getName())
            .actionId("_keep-alive")
            .initiatorComponentId("idle")
            .componentState(Map.of())
            .build());
    assertThat(keepAlives.get()).isEqualTo(before + 1);
  }

  @SuppressWarnings("unchecked")
  private static List<HeaderValueDto> headerUpdates(UIIncrementDto increment) {
    return increment.commands().stream()
        .filter(c -> c.type() == UICommandTypeDto.UpdateHeaderValue)
        .map(c -> (HeaderValueDto) c.data())
        .toList();
  }

  private static void await(java.util.function.BooleanSupplier condition) {
    var deadline = System.nanoTime() + Duration.ofSeconds(5).toNanos();
    while (!condition.getAsBoolean()) {
      if (System.nanoTime() > deadline) throw new AssertionError("timed out");
      try {
        Thread.sleep(20);
      } catch (InterruptedException e) {
        Thread.currentThread().interrupt();
        throw new AssertionError(e);
      }
    }
  }
}
