package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.ServerSideComponentDto;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * A definition-only {@code type: Listing} (no view model) whose Delete acts on the SELECTED rows.
 *
 * <p>Two things had to be true for a pure-DSL listing to delete the checked rows: the Listing had
 * to carry the declared {@code actions:} on the wire (a Listing is a layout like any other, so
 * {@link io.mateu.core.application.runaction.ActionInstanceCreator} wraps it in a SeededYamlPage
 * the moment it declares one), and the restAction had to say it runs once per selected row. This
 * pins both — a classless listing reaches the wire as a server-side component whose delete action
 * carries {@code forEachSelectedRow}, keeps the secret server-side (proxy), and points back at
 * itself to reload.
 */
class RestActionBulkSyncTest {

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis();
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private static ServerSideComponentDto page() {
    var increment = mateu.sync("/bulk-list");
    assertThat(increment.fragments()).as("the listing should render").isNotEmpty();
    var component = increment.fragments().get(0).component();
    assertThat(component)
        .as("a Listing declaring actions is a server-side component, not a bare layout")
        .isInstanceOf(ServerSideComponentDto.class);
    return (ServerSideComponentDto) component;
  }

  @Test
  void theListingCarriesItsDeclaredBulkAction() {
    assertThat(page().actions()).extracting(a -> a.id()).contains("delete-selected");
  }

  @Test
  void theBulkActionRunsOncePerSelectedRow() {
    var del =
        page().actions().stream()
            .filter(a -> "delete-selected".equals(a.id()))
            .findFirst()
            .orElseThrow();
    // The gate that stops it firing with nothing checked, and the flag the renderer loops on.
    assertThat(del.rowsSelectedRequired()).isTrue();
    assertThat(del.restAction()).isNotNull();
    assertThat(del.restAction().forEachSelectedRow())
        .as("the delete runs once per selected row")
        .isTrue();
    // After the rows are gone the client reloads the listing.
    assertThat(del.restAction().successRoute()).isEqualTo("bulk-list");
  }

  @Test
  void theSecretNeverReachesTheWire() {
    var del =
        page().actions().stream()
            .filter(a -> "delete-selected".equals(a.id()))
            .findFirst()
            .orElseThrow();
    assertThat(del.restAction().source().proxy())
        .as("a per-row delete carrying a secret is made server-side")
        .isTrue();
    assertThat(del.restAction().source().headers().get("X-Api-Key"))
        .as("the placeholder travels as a placeholder, resolved only on the server")
        .isEqualTo("${secret.WRITE_KEY}");
  }
}
