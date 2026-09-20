package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.ClientSideComponentDto;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * The Java golden for the client-side expander's LISTING handling (Phase 6, coherence-plan #1). A
 * simple read-only Listing definition (read-listing.yaml: rowsSource + columns + rowRoute, no
 * viewModel, no proxy actions) renders as a DIRECT {@code ClientSide} {@code Crud} — the {@code
 * ServerSide} {@code SeededYamlPage} wrapper only appears when the page has server-side
 * actions/secrets to run (as in bulk-list). So a read+navigate listing is fully reproducible by the
 * client-side expander (design/phase6-client-side-expander.md); this pins the shape it mirrors.
 */
class ReadListingDefinitionSyncTest {

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
  void aReadOnlyListingRendersAsADirectClientSideCrud() {
    var increment = mateu.sync("/read-listing");
    assertThat(increment.fragments()).as("the listing should render").isNotEmpty();
    var component = increment.fragments().get(0).component();

    // No proxy/secret actions ⇒ no ServerSide SeededYamlPage wrapper: the root is the Crud itself.
    assertThat(component)
        .as("a read-only listing is a direct ClientSide component, not a ServerSide page")
        .isInstanceOf(ClientSideComponentDto.class);
    var crud = (ClientSideComponentDto) component;
    assertThat(crud.metadata().getClass().getSimpleName()).contains("Crud");
  }
}
