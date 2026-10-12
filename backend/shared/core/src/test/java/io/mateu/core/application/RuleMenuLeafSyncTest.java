package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.Rule;
import io.mateu.uidl.data.RuleAction;
import java.util.Map;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * A menu leaf is one of two primitives: a route or a rule. A {@code @Menu} field typed {@code Rule}
 * (or {@code List<Rule>}) becomes the rule leaf — clicking it runs client-side rules instead of
 * navigating — and carries them in {@code MenuOptionDto.rules}; every other field shape is a route
 * leaf.
 */
class RuleMenuLeafSyncTest {

  @SuppressWarnings("unused")
  @UI("/rulemenu")
  static class RuleMenuApp {
    @Menu String catalog = "/rulemenu/catalog"; // a route leaf
    @Menu Rule refresh = Rule.builder().actionId("refreshAll").build(); // a rule leaf

    @Menu RulesGroup more; // a group holding a rule leaf

    public Message refreshAll() {
      return new Message("refreshed");
    }

    public Message archiveAll() {
      return new Message("archived");
    }
  }

  public static class RulesGroup {
    @Menu Rule archive = Rule.builder().action(RuleAction.RunAction).actionId("archiveAll").build();
  }

  /** A screen of the app: whatever is on screen, the menu's action is the APP's. */
  @UI("/rulemenu/catalog")
  static class Catalog {
    public String name;
  }

  static TestMateu mateu;
  static final ObjectMapper json = new ObjectMapper();

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(RuleMenuApp.class, Catalog.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  @Test
  void aMenuFieldTypedRuleBecomesARuleLeafCarryingItsRules() throws Exception {
    var wire = json.writeValueAsString(mateu.sync("/rulemenu"));

    // the rule leaf carries its rule (its actionId) in the menu option's `rules`
    assertThat(wire).contains("refreshAll");
    // the route leaf is untouched — still a route
    assertThat(wire).contains("rulemenu/catalog");
  }

  /**
   * Clicking the leaf dispatches its action on the app-level rail (serverSideType = the app class,
   * no route of its own), like a header action. The browser used to hand it to the on-screen
   * component, which does not advertise it (nothing happened); and on the rail the server answered
   * "Not found." — only header actions, FABs and app shortcuts were app-level.
   */
  @Test
  void aRuleLeafsActionRunsOnTheApp() throws Exception {
    var wire = json.writeValueAsString(click("refreshAll"));
    assertThat(wire).contains("refreshed").doesNotContain("Not found.");
  }

  @Test
  void aRuleLeafInsideAGroupRunsOnTheAppToo() throws Exception {
    var wire = json.writeValueAsString(click("archiveAll"));
    assertThat(wire).contains("archived").doesNotContain("Not found.");
  }

  /** The app-level rail as the browser on /rulemenu sends it. */
  private static io.mateu.dtos.UIIncrementDto click(String actionId) {
    return mateu.runAt(
        "/rulemenu",
        RunActionRqDto.builder()
            .route("/_no_route")
            .consumedRoute("")
            .actionId(actionId)
            .serverSideType(RuleMenuApp.class.getName())
            .initiatorComponentId("ux")
            .componentState(Map.of())
            .parameters(Map.of())
            .build());
  }
}
