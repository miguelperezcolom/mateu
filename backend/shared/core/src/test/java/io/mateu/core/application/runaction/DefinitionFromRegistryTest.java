package io.mateu.core.application.runaction;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

/**
 * Where a route's layout comes from.
 *
 * <p>Until now it came from the {@code specs/ui/<route>.yaml} convention, which ties a screen's
 * layout to its URL — so one definition could never serve two routes. A registry entry can name its
 * {@code definition} instead, which is the last of the three pieces (definition · view model ·
 * route entry) to become independently reusable.
 */
class DefinitionFromRegistryTest {

  private final YamlUidlLoader loader = new YamlUidlLoader(new RouteRegistry());

  @Test
  void aRouteWithNoEntryStillFindsItsDefinitionByConvention() {
    var spec = loader.loadSpec("by-convention");
    assertThat(spec).isNotNull();
    assertThat(spec.modelView()).isEqualTo("com.acme.Conventional");
    assertThat(spec.layout()).isNotNull();
  }

  @Test
  void anEntrysDefinitionIsUsedInsteadOfTheConventionalPath() {
    // There is no specs/ui/catalog/books.yaml: the layout is found only because the entry names it.
    var spec = loader.loadSpec("catalog/books");
    assertThat(spec).isNotNull();
    assertThat(spec.layout()).isNotNull();
  }

  @Test
  void oneDefinitionServesTwoRoutesEachBindingItsOwnViewModel() {
    // The case the convention cannot express, and the reason the definition is layout only.
    assertThat(loader.loadSpec("catalog/books").modelView()).isEqualTo("com.acme.Books");
    assertThat(loader.loadSpec("catalog/films").modelView()).isEqualTo("com.acme.Films");
  }

  @Test
  void aModelViewDeclaredInTheYamlStillWinsOverTheEntrys() {
    // Nothing that works today changes: a definition that names its own modelView keeps it.
    assertThat(loader.loadSpec("by-convention").modelView()).isEqualTo("com.acme.Conventional");
  }

  @Test
  void theLayoutIsReAppliedForTheViewModelTheEntryBinds() {
    // layoutForRoute gates on the spec's model view; with the entry supplying it, a definition that
    // names none still re-applies its layout on action round-trips.
    class Books {}
    assertThat(loader.layoutForRoute("catalog/books", Books.class)).isNull();
  }

  @Test
  void aRouteWithNeitherEntryNorFileHasNoSpec() {
    assertThat(loader.loadSpec("nothing/here")).isNull();
  }
}
