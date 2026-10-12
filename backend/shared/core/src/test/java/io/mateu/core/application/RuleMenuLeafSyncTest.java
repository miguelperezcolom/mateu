package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.mateu.core.testutil.TestMateu;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Rule;
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

    @Menu
    Rule ping =
        Rule.builder()
            .action(io.mateu.uidl.data.RuleAction.RunAction)
            .actionId("pingServer")
            .build();

    static boolean pinged;

    public io.mateu.uidl.data.Message pingServer() {
      pinged = true;
      return io.mateu.uidl.data.Message.success("pong");
    }
  }

  static TestMateu mateu;
  static final ObjectMapper json = new ObjectMapper();

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(RuleMenuApp.class);
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

  @Test
  void theActionARuleLeafRunsIsDispatchedToTheApp() throws Exception {
    // the menu lives on the shell: the leaf's RunAction goes to the APP class (the header-action
    // rail), whatever screen is below — it used to be dispatched to the on-screen component,
    // which did not own it, and was lost (the actions walkthrough, 2026-10-12)
    var increment =
        mateu.run(
            io.mateu.dtos.RunActionRqDto.builder()
                .route("/rulemenu")
                .consumedRoute("")
                .actionId("pingServer")
                .serverSideType(RuleMenuApp.class.getName())
                .build());
    assertThat(RuleMenuApp.pinged).isTrue();
    assertThat(json.writeValueAsString(increment)).contains("pong");
  }
}
