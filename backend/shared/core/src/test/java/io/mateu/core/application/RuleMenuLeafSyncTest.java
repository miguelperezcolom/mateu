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
}
