package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.Map;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * Error and degenerate paths: unknown routes, throwing actions, unknown action ids, and apps
 * without a declared home route.
 */
class ErrorPathsSyncTest {

  @SuppressWarnings("unused")
  @UI("/fragile")
  public static class FragileForm {
    String name = "x";

    @Action
    void explode(HttpRequest httpRequest) {
      throw new RuntimeException("boom");
    }

    @Action
    void reject(HttpRequest httpRequest) {
      throw new IllegalArgumentException("bad input");
    }
  }

  @SuppressWarnings("unused")
  public static class SectionA {
    String a = "1";
  }

  /** App WITHOUT @HomeRoute — the home route resolution falls through its degenerate branches. */
  @SuppressWarnings("unused")
  @UI("/homeless")
  @Title("Homeless")
  public static class HomelessApp {
    @Menu SectionA first = new SectionA();
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(FragileForm.class, HomelessApp.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  // ── unknown routes ──────────────────────────────────────────────────────────

  @Test
  void unknownRoutesProduceANotFoundIncrement() {
    var increment = mateu.sync("/no-such-route");
    assertThat(increment).isNotNull();
    assertThat(increment.fragments()).isNotEmpty();
  }

  @Test
  void unknownNestedRoutesAlsoResolveToNotFound() {
    var increment = mateu.sync("/no/such/nested/route");
    assertThat(increment).isNotNull();
  }

  // ── throwing actions ────────────────────────────────────────────────────────

  @Test
  void throwingActionsStillReturnAnIncrement() {
    var increment = run("explode");
    assertThat(increment).isNotNull();
  }

  @Test
  void illegalArgumentsAreHandledToo() {
    var increment = run("reject");
    assertThat(increment).isNotNull();
  }

  @Test
  void unknownActionIdsAreHandled() {
    var increment = run("does-not-exist");
    assertThat(increment).isNotNull();
  }

  private UIIncrementDto run(String actionId) {
    return mateu.run(
        RunActionRqDto.builder()
            .route("/fragile")
            .actionId(actionId)
            .serverSideType(FragileForm.class.getName())
            .componentState(Map.of("name", "x"))
            .initiatorComponentId("fr_app")
            .build());
  }

  // ── app without home route ──────────────────────────────────────────────────

  @Test
  void appsWithoutHomeRouteStillSync() {
    var increment = mateu.sync("/homeless");
    var app =
        FullSyncPipelineTest.findMetadata(
            increment.fragments().get(0).component(), io.mateu.dtos.AppDto.class);
    assertThat(app).isNotNull();
    assertThat(app.homeRoute()).isNotNull();
  }
}
