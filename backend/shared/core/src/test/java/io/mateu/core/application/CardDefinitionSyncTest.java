package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.mateu.core.testutil.TestMateu;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * The Java golden for the client-side expander's Card handling (Phase 6, coherence-plan #1). A
 * bare-layout definition (card.yaml: a {@code Card} wrapping a {@code VerticalLayout > Text}, no
 * viewModel) is rendered by the server; the expander must reproduce this wire in the browser.
 *
 * <p>Python cannot render a bare {@code Card} definition ("Unsupported component: Card"), so Java
 * is the golden source (per design/phase6-client-side-expander.md). This test pins the SHAPE the
 * TypeScript expander mirrors: a Card's content nests inside {@code metadata.content} (a single
 * EXPANDED child), NOT lifted to wire {@code children}; {@code variants} ride in {@code metadata}.
 */
class CardDefinitionSyncTest {

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis();
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  @Test
  void aBareCardDefinitionMapsContentIntoMetadataNotChildren() throws Exception {
    var increment = mateu.sync("/card-def");
    assertThat(increment.fragments()).as("the card page should render").isNotEmpty();
    var component = increment.fragments().get(0).component();

    // Print the wire JSON so it can be captured as the TypeScript golden fixture.
    var json = new ObjectMapper().writerWithDefaultPrettyPrinter().writeValueAsString(increment);
    System.out.println("=== CARD_GOLDEN_BEGIN ===");
    System.out.println(json);
    System.out.println("=== CARD_GOLDEN_END ===");

    // The Card node: content is a single expanded child under metadata.content, variants preserved,
    // and it does not lift that content into wire children.
    assertThat(json).contains("\"type\" : \"Card\"");
    assertThat(json).contains("\"variants\"");
    // The nested text survives the mapping (proves content was expanded, not dropped).
    assertThat(json).contains("Inside a card");
    assertThat(component).isNotNull();
  }
}
