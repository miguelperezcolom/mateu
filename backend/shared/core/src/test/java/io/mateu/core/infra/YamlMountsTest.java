package io.mateu.core.infra;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import org.junit.jupiter.api.Test;

class YamlMountsTest {

  @Test
  void pathsOfARootAndANestedMount() {
    var root = new YamlMounts.Mount("", "Root");
    var backOffice = new YamlMounts.Mount("back-office", "BO");
    assertThat(root.spaPath()).isEqualTo("/");
    assertThat(root.apiPrefix()).isEqualTo("/mateu");
    assertThat(backOffice.spaPath()).isEqualTo("/back-office");
    assertThat(backOffice.apiPrefix()).isEqualTo("/back-office/mateu");
  }

  @Test
  void theLongestApiPrefixOwnsTheRequest() {
    var root = new YamlMounts.Mount("", "Root");
    var backOffice = new YamlMounts.Mount("back-office", "BO");
    var mounts = List.of(root, backOffice);
    assertThat(YamlMounts.mountForApiPath(mounts, "/back-office/mateu/v3/sync/x"))
        .isSameAs(backOffice);
    assertThat(YamlMounts.mountForApiPath(mounts, "/mateu/v3/sync/x")).isSameAs(root);
    assertThat(YamlMounts.mountForApiPath(mounts, "/api/x")).isNull();
  }

  @Test
  void aNestedMountsUiIsAimedAtItsAbsolutePath() {
    // a bare "back-office" resolved against /back-office/x posted to /back-office/back-office/mateu
    assertThat(YamlMounts.uiPath("back-office")).isEqualTo("/back-office");
    assertThat(YamlMounts.uiPath("")).isEmpty();
    assertThat(YamlMounts.uiPath(null)).isEmpty();
  }

  @Test
  void aNestedMountResolvesTheRouteTheClientSendsRelativeToIt() {
    // the client strips the baseUrl (/orders) from the browser path; the registry keys the mount's
    // routes with the mount on them
    assertThat(YamlMounts.mountRequest("orders", rq("/list")).route()).isEqualTo("/orders/list");
    assertThat(YamlMounts.mountRequest("orders", rq("list/7")).route()).isEqualTo("/orders/list/7");
    assertThat(YamlMounts.mountRequest("orders", rq("")).route()).isEqualTo("/orders");
    assertThat(YamlMounts.mountRequest("orders", rq(null)).route()).isEqualTo("/orders");
    // a route the server sent back already names the mount
    assertThat(YamlMounts.mountRequest("orders", rq("/orders/list")).route())
        .isEqualTo("/orders/list");
    assertThat(YamlMounts.mountRequest("orders", rq("/orders")).route()).isEqualTo("/orders");
    // …but a sibling that only shares the prefix does not
    assertThat(YamlMounts.mountRequest("orders", rq("/orders-archive")).route())
        .isEqualTo("/orders/orders-archive");
    // the root mount is untouched, and so is everything but the route
    var root = rq("/list");
    assertThat(YamlMounts.mountRequest("", root)).isSameAs(root);
    var moved = YamlMounts.mountRequest("orders", rq("/list"));
    assertThat(moved.actionId()).isEqualTo("search");
    assertThat(moved.consumedRoute()).isEqualTo("_empty");
    assertThat(moved.componentState()).containsEntry("q", "x");
  }

  private static io.mateu.dtos.RunActionRqDto rq(String route) {
    return new io.mateu.dtos.RunActionRqDto(
        java.util.Map.of("q", "x"),
        java.util.Map.of(),
        java.util.Map.of(),
        "c1",
        "_empty",
        "search",
        route,
        null,
        null,
        null);
  }

  @Test
  void yamlMountsAreServedNextToTheClassesButAPathAClassServesIsLeftToIt() {
    var mounts =
        List.of(
            new YamlMounts.Mount("", "Root"),
            new YamlMounts.Mount("console", "Console"),
            new YamlMounts.Mount("admin", "Admin"));
    // a root @UI and an @UI at /admin: only the console is the YAML surface's (it used to stand
    // down entirely, so every YAML mount of a mixed deployment answered 404)
    assertThat(YamlMounts.notServedByClasses(mounts, List.of("", "/admin")))
        .extracting(YamlMounts.Mount::basePath)
        .containsExactly("console");
    assertThat(YamlMounts.notServedByClasses(mounts, List.of())).hasSize(3);
  }
}
