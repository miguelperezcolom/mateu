package io.mateu.uidl.data;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.uidl.fluent.Component;
import org.junit.jupiter.api.Test;

/**
 * The business-component catalogue's record logic (coherence-plan #13): look up by name, and merge
 * an authored catalogue over a derived one with the authored entry winning — the same contract the
 * REST source catalogue and the route table follow.
 */
class ComponentCatalogTest {

  // The composition a name stands for is irrelevant to the table's name-keyed logic; a marker
  // component keeps the test independent of the fluent catalog.
  private static Component marker() {
    return new Component() {};
  }

  @Test
  void namesTheEntriesAndLooksThemUp() {
    var c = marker();
    var catalog = new ComponentCatalog(java.util.List.of(new ComponentEntry("AgencySelector", c)));

    assertThat(catalog.hasNoComponents()).isFalse();
    assertThat(catalog.get("AgencySelector")).map(ComponentEntry::component).contains(c);
    assertThat(catalog.get("Unknown")).isEmpty();
    assertThat(catalog.get(" ")).isEmpty();
    assertThat(ComponentCatalog.empty().hasNoComponents()).isTrue();
  }

  @Test
  void nameIsTrimmedAndAuthoredWinsOverDerived() {
    var derived =
        new ComponentCatalog(
            java.util.List.of(
                new ComponentEntry("AgencySelector", marker()),
                new ComponentEntry("CountryPicker", marker())));
    var authoredWinner = marker();
    var authored =
        new ComponentCatalog(
            java.util.List.of(new ComponentEntry("  AgencySelector  ", authoredWinner)));

    var merged = authored.mergedOver(derived);

    // The authored entry replaced the derived one (name trimmed), the other derived entry survived.
    assertThat(merged.get("AgencySelector"))
        .map(ComponentEntry::component)
        .contains(authoredWinner);
    assertThat(merged.get("CountryPicker")).isPresent();
    assertThat(merged.components()).hasSize(2);
  }
}
