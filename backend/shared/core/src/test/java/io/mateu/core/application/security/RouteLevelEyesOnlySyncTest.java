package io.mateu.core.application.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.ServerSideComponentDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.EyesOnly;
import io.mateu.uidl.annotations.UI;
import java.util.ArrayList;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * A routed screen restricted with a class-level {@code @EyesOnly} must be refused on its FIRST load
 * too — the plain route load a user gets by typing the URL, where the request names no {@code
 * serverSideType} yet. Hiding the menu entry is not access control.
 */
class RouteLevelEyesOnlySyncTest {

  static final AtomicInteger CONSTRUCTED = new AtomicInteger();

  @UI("/supervisor-only")
  @EyesOnly(roles = "supervisor")
  public static class SupervisorScreen {
    public String secret = "only for supervisors";

    public SupervisorScreen() {
      CONSTRUCTED.incrementAndGet();
    }
  }

  private static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(SupervisorScreen.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private static RunActionRqDto load() {
    return RunActionRqDto.builder()
        .route("/supervisor-only")
        .consumedRoute("")
        .actionId("")
        .componentState(Map.of())
        .initiatorComponentId("c1")
        .build();
  }

  private static Map<String, String> token(String... roles) {
    return io.mateu.core.testutil.TestIdentities.headersWithRoles(roles);
  }

  private static String serverSideTypeOf(UIIncrementDto increment) {
    return increment.fragments().stream()
        .map(fragment -> fragment.component())
        .filter(ServerSideComponentDto.class::isInstance)
        .map(component -> ((ServerSideComponentDto) component).serverSideType())
        .findFirst()
        .orElse(null);
  }

  @Test
  void theFirstLoadOfARestrictedRouteIsRefusedWithoutTheRole() {
    assertThatThrownBy(() -> mateu.run(load(), token("housekeeping")))
        .satisfies(
            error -> {
              var names = new ArrayList<String>();
              for (Throwable t = error; t != null; t = t.getCause()) {
                names.add(t.getClass().getSimpleName());
              }
              assertThat(names).contains("MateuForbiddenException");
            });
  }

  @Test
  void theFirstLoadOfARestrictedRouteIsRefusedWithNoToken() {
    assertThatThrownBy(() -> mateu.run(load()))
        .satisfies(
            error -> {
              var names = new ArrayList<String>();
              for (Throwable t = error; t != null; t = t.getCause()) {
                names.add(t.getClass().getSimpleName());
              }
              assertThat(names).contains("MateuForbiddenException");
            });
  }

  @Test
  void theFirstLoadWorksWithTheRole() {
    var increment = mateu.run(load(), token("supervisor"));
    assertThat(serverSideTypeOf(increment)).isEqualTo(SupervisorScreen.class.getName());
  }
}
