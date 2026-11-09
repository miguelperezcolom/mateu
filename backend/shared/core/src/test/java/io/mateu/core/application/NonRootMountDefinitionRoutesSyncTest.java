package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.mateu.core.testutil.SpecsDir;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.uidl.annotations.App;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.RouteLink;
import io.mateu.uidl.fluent.AppVariant;
import java.nio.file.Path;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

/**
 * A standalone {@code type: Routes} file tagged {@code basePath:} of a CLASS-declared non-root
 * mount, whose routes are DEFINITION-ONLY (a {@code layout:}, no view model). Its routes were
 * registered (absolute, {@code apps/permissions/managers}) but their content loads — relative to
 * the mount, as the browser sends them — answered "Page not found": only view-model routes were
 * looked up with the mount in front. {@code basePath: ""} worked, which is the workaround the
 * Explorer had to use.
 */
class NonRootMountDefinitionRoutesSyncTest {

  @TempDir Path dir;

  @UI("/apps/permissions")
  @Title("Permissions")
  @App(AppVariant.MENU_ON_TOP)
  public static class PermissionsApp {
    @Menu RouteLink managers = new RouteLink("/managers", "Managers");
  }

  private String content(String route) throws Exception {
    return content(route, "/apps/permissions", true);
  }

  private String content(String route, String basePath, boolean typed) throws Exception {
    var root =
        SpecsDir.write(
            dir,
            Map.of(
                "permissions/routes.yaml",
                """
                type: Routes
                basePath: "%s"
                routes:
                  - route: managers
                    layout: permissions/managers.yaml
                  - route: secret
                    layout: permissions/managers.yaml
                    access: {roles: [manager]}
                """
                    .formatted(basePath),
                "permissions/managers.yaml",
                """
                layout:
                  type: Text
                  text: Managers only page
                """));
    return SpecsDir.over(
        root,
        cl -> {
          try (var mateu = TestMateu.withUis(PermissionsApp.class)) {
            var increment =
                mateu.runAt(
                    "/apps/permissions",
                    RunActionRqDto.builder()
                        .route(route)
                        .consumedRoute("")
                        .serverSideType(typed ? PermissionsApp.class.getName() : null)
                        .actionId("")
                        .initiatorComponentId("ux")
                        .componentState(Map.of())
                        .parameters(Map.of())
                        .build());
            return new ObjectMapper().writeValueAsString(increment);
          } catch (Exception e) {
            throw new RuntimeException(e);
          }
        });
  }

  @Test
  void aDefinitionOnlyRouteOfTheMountsRouteFileIsServedRelativeToTheMount() throws Exception {
    assertThat(content("/managers"))
        .contains("Managers only page")
        .doesNotContain("Page not found");
  }

  @Test
  void aRouteAccessOfTheMountsRouteFileIsEnforcedOnTheRelativeSpelling() {
    org.assertj.core.api.Assertions.assertThatThrownBy(() -> content("/secret"))
        .hasStackTraceContaining("not allowed");
  }

  @Test
  void aRouteFileOfTheRootStillServesTheMountLikeBefore() throws Exception {
    assertThat(content("/managers", "", true)).contains("Managers only page");
  }

  @Test
  void aContentLoadByRouteAloneIsServedToo() throws Exception {
    assertThat(content("/managers", "/apps/permissions", false)).contains("Managers only page");
  }

  @Test
  void aRouteFileOfTheRootStillServesARouteOnlyLoad() throws Exception {
    assertThat(content("/managers", "", false)).contains("Managers only page");
  }
}
