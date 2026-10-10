package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import io.mateu.core.application.security.MateuForbiddenException;
import io.mateu.core.testutil.SpecsDir;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

/**
 * Declarative permissions in YAML — the data twin of {@code @EyesOnly} / {@code @ReadOnlyUnless} /
 * {@code @DisabledUnless}, evaluated by the same Authorizer, ON THE SERVER, for the request's
 * token:
 *
 * <ul>
 *   <li>{@code access:} on a route → 403 for it and everything nested under it;
 *   <li>{@code access:} on a menu item → not sent; a RouteLink inherits its route's;
 *   <li>{@code eyesOnly} / {@code readOnlyUnless} / {@code disabledUnless} on components;
 *   <li>{@code access:} on a declared action → not advertised, its buttons disabled, 403 if called.
 * </ul>
 */
class YamlSecuritySyncTest {

  private static final ObjectMapper JSON =
      new ObjectMapper()
          .registerModule(new JavaTimeModule())
          .disable(SerializationFeature.FAIL_ON_EMPTY_BEANS);

  @TempDir Path dir;

  // ── fixtures ────────────────────────────────────────────────────────────────────────────────

  private static final String ROUTES =
      """
      type: Routes
      routes:
        - route: admin/users
          layout: users.yaml
          access: {roles: [admin]}
          children:
            - route: audit
              layout: plain.yaml
        - route: salaries
          layout: salaries.yaml
        - route: plain
          layout: plain.yaml
        - route: reports
          layout: plain.yaml
          access: auditor
      """;

  private static final String PLAIN =
      """
      layout:
        type: VerticalLayout
        content:
          - type: Text
            text: "Plain page"
      """;

  private static final String USERS =
      """
      layout:
        type: VerticalLayout
        content:
          - type: Text
            text: "Users admin"
      """;

  private static final String SALARIES =
      """
      layout:
        type: VerticalLayout
        content:
          - type: Text
            text: "Public text"
          - type: Text
            text: "Secret text"
            eyesOnly: {roles: [hr]}
          - type: FormField
            id: salary
            label: Salary
            dataType: number
            readOnlyUnless: {roles: [hr]}
          - type: FormField
            id: name
            label: Name
            dataType: string
            disabledUnless: {roles: [manager]}
          - type: Button
            label: Approve
            actionId: approve
            disabledUnless: {roles: [manager]}
          - type: Button
            label: Delete
            actionId: delete
      actions:
        - id: delete
          access: {roles: [manager]}
          restAction:
            source:
              url: https://api.invalid/salaries/${state.id}
              method: DELETE
        - id: approve
          restAction:
            source:
              url: https://api.invalid/salaries/approve
              method: POST
      """;

  private static final String SHELL_ROUTES =
      """
      type: Routes
      routes:
        - route: ""
          layout: shell.yaml
        - route: public
          layout: plain.yaml
        - route: admin/users
          layout: plain.yaml
          access: {roles: [admin]}
        - route: reports
          layout: plain.yaml
        - route: settings
          layout: plain.yaml
      """;

  private static final String SHELL =
      """
      type: AppShell
      title: Secured
      homeRoute: public
      menu:
        - type: RouteLink
          label: Public page
          route: public
        - type: RouteLink
          label: Users page
          route: admin/users
        - type: RouteLink
          label: Reports page
          route: reports
          access: {roles: [auditor]}
        - type: Menu
          label: Admin group
          submenu:
            - type: RouteLink
              label: Settings page
              route: settings
              access: [admin]
      """;

  private Path pages() {
    return SpecsDir.write(
        dir,
        Map.of(
            "routes.yaml", ROUTES,
            "plain.yaml", PLAIN,
            "users.yaml", USERS,
            "salaries.yaml", SALARIES));
  }

  private Path shell() {
    return SpecsDir.write(
        dir, Map.of("routes.yaml", SHELL_ROUTES, "plain.yaml", PLAIN, "shell.yaml", SHELL));
  }

  // ── helpers ─────────────────────────────────────────────────────────────────────────────────

  /** A JWT carrying {@code roles} (unsigned — the Authorizer reads the claims). */
  static Map<String, String> as(String... roles) {
    var header =
        Base64.getUrlEncoder()
            .withoutPadding()
            .encodeToString("{\"alg\":\"none\"}".getBytes(StandardCharsets.UTF_8));
    var claims = new StringBuilder("{\"roles\":[");
    for (int i = 0; i < roles.length; i++) {
      claims.append(i == 0 ? "" : ",").append('"').append(roles[i]).append('"');
    }
    claims.append("]}");
    var payload =
        Base64.getUrlEncoder()
            .withoutPadding()
            .encodeToString(claims.toString().getBytes(StandardCharsets.UTF_8));
    return Map.of("Authorization", "Bearer " + header + "." + payload + ".sig");
  }

  static final Map<String, String> ANONYMOUS = Map.of();

  private static JsonNode run(Path root, RunActionRqDto rq, Map<String, String> headers) {
    return SpecsDir.over(
        root,
        cl -> {
          try (var mateu = TestMateu.withUis()) {
            return JSON.valueToTree(mateu.run(rq, headers));
          }
        });
  }

  private static JsonNode load(Path root, String route, Map<String, String> headers) {
    return run(root, RunActionRqDto.builder().route(route).actionId("").build(), headers);
  }

  private static Throwable refusal(Path root, RunActionRqDto rq, Map<String, String> headers) {
    return SpecsDir.over(
        root,
        cl -> {
          try (var mateu = TestMateu.withUis()) {
            try {
              mateu.run(rq, headers);
              return null;
            } catch (Throwable t) {
              return t;
            }
          }
        });
  }

  /** Every object node with {@code "type": type} anywhere in the wire. */
  private static List<JsonNode> ofType(JsonNode wire, String type) {
    var out = new ArrayList<JsonNode>();
    collect(wire, type, out);
    return out;
  }

  private static void collect(JsonNode node, String type, List<JsonNode> out) {
    if (node == null) {
      return;
    }
    if (node.isObject() && type.equals(node.path("type").asText())) {
      out.add(node);
    }
    node.forEach(child -> collect(child, type, out));
  }

  private static JsonNode field(JsonNode wire, String fieldId) {
    return ofType(wire, "FormField").stream()
        .filter(f -> fieldId.equals(f.path("fieldId").asText(f.path("id").asText())))
        .findFirst()
        .orElseThrow(() -> new AssertionError("no field " + fieldId + " in " + wire));
  }

  private static JsonNode button(JsonNode wire, String actionId) {
    return ofType(wire, "Button").stream()
        .filter(b -> actionId.equals(b.path("actionId").asText()))
        .findFirst()
        .orElseThrow(() -> new AssertionError("no button " + actionId + " in " + wire));
  }

  private static List<String> advertisedActions(JsonNode wire) {
    var out = new ArrayList<String>();
    // every `actions` array of objects carrying an id (the server-side component's advertised set)
    wire.findValues("actions")
        .forEach(
            list ->
                list.forEach(
                    a -> {
                      if (a.hasNonNull("id")) {
                        out.add(a.get("id").asText());
                      }
                    }));
    return out;
  }

  // ── routes ──────────────────────────────────────────────────────────────────────────────────

  @Test
  void aRouteWithAccessIsRefusedToACallerWhoDoesNotSatisfyIt() {
    var root = pages();
    var rq = RunActionRqDto.builder().route("/admin/users").actionId("").build();
    assertThat(refusal(root, rq, ANONYMOUS)).isInstanceOf(MateuForbiddenException.class);
    assertThat(refusal(root, rq, as("staff"))).isInstanceOf(MateuForbiddenException.class);
    assertThat(load(root, "/admin/users", as("admin")).toString()).contains("Users admin");
  }

  @Test
  void everythingNestedUnderARestrictedRouteIsRefusedToo() {
    var root = pages();
    var child = RunActionRqDto.builder().route("/admin/users/audit").actionId("").build();
    assertThat(refusal(root, child, as("staff"))).isInstanceOf(MateuForbiddenException.class);
    assertThat(load(root, "/admin/users/audit", as("admin")).toString()).contains("Plain page");
  }

  @Test
  void theRolesShorthandAndUnrestrictedRoutesBehave() {
    var root = pages();
    var reports = RunActionRqDto.builder().route("/reports").actionId("").build();
    assertThat(refusal(root, reports, as("admin"))).isInstanceOf(MateuForbiddenException.class);
    assertThat(load(root, "/reports", as("auditor")).toString()).contains("Plain page");
    assertThat(load(root, "/plain", ANONYMOUS).toString()).contains("Plain page");
  }

  // ── components ──────────────────────────────────────────────────────────────────────────────

  @Test
  void componentStatesFollowTheCallersIdentity() {
    var root = pages();

    var anonymous = load(root, "/salaries", ANONYMOUS);
    assertThat(anonymous.toString()).contains("Public text").doesNotContain("Secret text");
    assertThat(field(anonymous, "salary").path("readOnly").asBoolean()).isTrue();
    assertThat(field(anonymous, "name").path("readOnly").asBoolean()).isTrue();
    assertThat(button(anonymous, "approve").path("disabled").asBoolean()).isTrue();

    var granted = load(root, "/salaries", as("hr", "manager"));
    assertThat(granted.toString()).contains("Public text").contains("Secret text");
    assertThat(field(granted, "salary").path("readOnly").asBoolean()).isFalse();
    assertThat(field(granted, "name").path("readOnly").asBoolean()).isFalse();
    assertThat(button(granted, "approve").path("disabled").asBoolean()).isFalse();
  }

  @Test
  void theAccessKeysNeverReachTheWire() {
    var wire = load(pages(), "/salaries", ANONYMOUS).toString();
    assertThat(wire).doesNotContain("eyesOnly").doesNotContain("readOnlyUnless");
    assertThat(wire).doesNotContain("disabledUnless");
  }

  @Test
  void aLockedFieldKeepsItsServerValueRatherThanTheClients() {
    var root = pages();
    var rq =
        RunActionRqDto.builder()
            .route("/salaries")
            .actionId("")
            .componentState(Map.of("salary", 99999, "id", "7"))
            .build();
    var anonymous = run(root, rq, ANONYMOUS).toString();
    assertThat(anonymous).doesNotContain("99999").contains("\"id\":\"7\"");
    var hr = run(root, rq, as("hr")).toString();
    assertThat(hr).contains("99999");
  }

  // ── actions ─────────────────────────────────────────────────────────────────────────────────

  @Test
  void aRestrictedActionIsNotAdvertisedAndItsButtonIsDisabled() {
    var root = pages();
    var anonymous = load(root, "/salaries", ANONYMOUS);
    assertThat(advertisedActions(anonymous)).contains("approve").doesNotContain("delete");
    assertThat(button(anonymous, "delete").path("disabled").asBoolean()).isTrue();

    var manager = load(root, "/salaries", as("manager"));
    assertThat(advertisedActions(manager)).contains("approve", "delete");
    assertThat(button(manager, "delete").path("disabled").asBoolean()).isFalse();
  }

  @Test
  void aRestrictedActionThatReachesTheServerIsRefused() {
    var root = pages();
    var call = RunActionRqDto.builder().route("/salaries").actionId("delete").build();
    assertThat(refusal(root, call, as("staff"))).isInstanceOf(MateuForbiddenException.class);
    // proxied through __restfetch__ by its source id: refused the same way
    var proxied =
        RunActionRqDto.builder()
            .route("/salaries")
            .actionId("__restfetch__")
            .parameters(Map.of("_sourceKind", "action", "_sourceId", "delete"))
            .build();
    assertThat(refusal(root, proxied, as("staff"))).isInstanceOf(MateuForbiddenException.class);
    // the manager is not refused (whatever the action then does)
    var manager = refusal(root, call, as("manager"));
    assertThat(manager == null || !(manager instanceof MateuForbiddenException)).isTrue();
  }

  // ── catalogue actions ───────────────────────────────────────────────────────────────────────

  private Path catalogue() {
    return SpecsDir.write(
        dir,
        Map.of(
            "routes.yaml",
            """
            type: Routes
            routes:
              - route: tools
                layout: tools.yaml
            """,
            "tools.yaml",
            """
            layout:
              type: VerticalLayout
              content:
                - {type: Button, label: Purge, actionId: purge}
                - {type: Button, label: Ping, actionId: ping}
            """,
            "actions.yaml",
            """
            type: Actions
            actions:
              - id: purge
                access: {roles: [admin]}
                restAction:
                  source: {url: https://api.invalid/purge, method: POST, proxy: true}
              - id: ping
                restAction:
                  source: {url: https://api.invalid/ping}
            """));
  }

  @Test
  void aCatalogueActionsAccessIsEnforcedLikeAPageActions() {
    var root = catalogue();
    var anonymous = load(root, "/tools", ANONYMOUS);
    assertThat(advertisedActions(anonymous)).contains("ping").doesNotContain("purge");
    assertThat(button(anonymous, "purge").path("disabled").asBoolean()).isTrue();
    assertThat(button(anonymous, "ping").path("disabled").asBoolean()).isFalse();

    var admin = load(root, "/tools", as("admin"));
    assertThat(advertisedActions(admin)).contains("ping", "purge");
    assertThat(button(admin, "purge").path("disabled").asBoolean()).isFalse();

    var call = RunActionRqDto.builder().route("/tools").actionId("purge").build();
    assertThat(refusal(root, call, as("staff"))).isInstanceOf(MateuForbiddenException.class);
    var proxied =
        RunActionRqDto.builder()
            .route("/tools")
            .actionId("__restfetch__")
            .parameters(Map.of("_sourceKind", "action", "_sourceId", "purge"))
            .build();
    assertThat(refusal(root, proxied, as("staff"))).isInstanceOf(MateuForbiddenException.class);
  }

  // ── menu ────────────────────────────────────────────────────────────────────────────────────

  @Test
  void menuItemsTheCallerMayNotReachAreNotSent() {
    var root = shell();
    var rq = RunActionRqDto.builder().route("/").consumedRoute("_empty").actionId("").build();

    var anonymous = run(root, rq, ANONYMOUS).toString();
    assertThat(anonymous).contains("Public page");
    assertThat(anonymous)
        .as("a RouteLink to a route with access: inherits it")
        .doesNotContain("Users page");
    assertThat(anonymous).doesNotContain("Reports page");
    assertThat(anonymous)
        .as("a Menu group left empty disappears")
        .doesNotContain("Settings page")
        .doesNotContain("Admin group");

    var admin = run(root, rq, as("admin", "auditor")).toString();
    assertThat(admin)
        .contains("Public page")
        .contains("Users page")
        .contains("Reports page")
        .contains("Admin group")
        .contains("Settings page");
  }
}
