package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.ServerSideComponentDto;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * A definition-only page (no view model, no Java anywhere) that declares its own {@code actions:}.
 *
 * <p>This is the write half of the DSL. Reading was already expressible — a listing names a source
 * and the client fetches it — but nothing let a classless page CALL an endpoint, because every
 * other producer of actions reads them off a Java class. The wire and the renderer were both ready:
 * an action has carried a {@code restAction} for a while and the client runs it without a round
 * trip. What these tests pin is that a YAML page can now put one there.
 */
class YamlDeclaredActionsSyncTest {

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
    var increment = mateu.sync("/yaml-write");
    assertThat(increment.fragments()).as("the page should render").isNotEmpty();
    var component = increment.fragments().get(0).component();
    assertThat(component)
        .as("a page declaring actions is a server-side component, not a bare layout")
        .isInstanceOf(ServerSideComponentDto.class);
    return (ServerSideComponentDto) component;
  }

  @Test
  void aDeclaredActionReachesTheWire() {
    var actions = page().actions();
    assertThat(actions).extracting(a -> a.id()).contains("save", "remove");
  }

  @Test
  void itCarriesTheRestCallTheClientWillMake() {
    var save =
        page().actions().stream().filter(a -> "save".equals(a.id())).findFirst().orElseThrow();
    assertThat(save.restAction()).isNotNull();
    assertThat(save.restAction().source().url()).isEqualTo("https://example.test/api/people");
    assertThat(save.restAction().source().method()).isEqualTo("POST");
    // The body is a TEMPLATE, deliberately left uninterpolated on the wire: it is resolved against
    // the live state at the moment of the click, not against whatever the state was when the page
    // was built.
    assertThat(save.restAction().source().body()).contains("${state.name}");
    assertThat(save.restAction().successMessage()).isEqualTo("Saved");
    // A successRoute is a TEMPLATE too, resolved after the response merges — so a just-saved
    // record's id lands the client on its own read-only view.
    assertThat(save.restAction().successRoute()).isEqualTo("people/${state.id}");
  }

  @Test
  void aSecretIsNotResolvedOnTheWireThatTravelsToTheBrowser() {
    var remove =
        page().actions().stream().filter(a -> "remove".equals(a.id())).findFirst().orElseThrow();
    assertThat(remove.restAction().source().proxy())
        .as("a call carrying a secret has to be made server-side")
        .isTrue();
    // The placeholder travels as a placeholder. Were the value substituted here, an API key would
    // be sitting in the JSON any viewer can read.
    assertThat(remove.restAction().source().headers().get("X-Api-Key"))
        .isEqualTo("${secret.WRITE_KEY}");
  }

  @Test
  void aPageWithoutDeclaredActionsClaimsNone() {
    // The ActionSupplier default is a single "*", which tells the client every action is claimed
    // and dispatched to the server — exactly wrong for a page with no server behind it. A static
    // definition-only page must keep its bare-layout shape.
    var increment = mateu.sync("/about");
    var component = increment.fragments().get(0).component();
    if (component instanceof ServerSideComponentDto serverSide) {
      assertThat(serverSide.actions()).isNullOrEmpty();
    }
  }

  @Test
  void theStateIsStillSeededAlongsideTheActions() {
    // Actions must not displace what the route seeds: the same page reads AND writes, and the body
    // of the write is a template over exactly this state.
    var fragment = mateu.sync("/yaml-write").fragments().get(0);
    var component = (ServerSideComponentDto) fragment.component();
    assertThat(component.actions()).extracting(a -> a.id()).contains("save");
    assertThat(String.valueOf(fragment.state()))
        .as("the route's state seed should have reached the page")
        .contains("Leia");
  }
}
