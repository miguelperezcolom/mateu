package io.mateu.core.application.runaction;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.uidl.data.ComponentEntry;
import org.junit.jupiter.api.Test;

/**
 * The business-component catalogue registry (coherence-plan #13): the authored {@code
 * specs/ui/components.yaml} is read, its component trees parsed, and a reference resolves to the
 * named entry — the twin of {@link RestSourceRegistryTest}, one level up.
 */
class ComponentRegistryTest {

  private final ComponentRegistry registry = new ComponentRegistry();

  @Test
  void theAuthoredCatalogueIsReadFromTheConventionalFile() {
    var authored = registry.authoredFrom(getClass().getClassLoader());
    assertThat(authored.components()).extracting(ComponentEntry::name).contains("AgencySelector");
    // the composition parsed to a fluent component (not left as raw YAML)
    assertThat(authored.get("AgencySelector")).isPresent();
    assertThat(authored.get("AgencySelector").orElseThrow().component()).isNotNull();
  }

  @Test
  void aReferenceResolvesThroughTheMergedCatalogue() {
    // load() merges authored over derived (no supplier beans in a bare test); the authored entry
    // is therefore resolvable by name — what a surface's ref will look up.
    var merged = registry.load(getClass().getClassLoader());
    assertThat(merged.get("AgencySelector")).isPresent();
    assertThat(merged.get("Unknown")).isEmpty();
  }

  @Test
  void noCatalogueFileIsNotAnError() {
    // An app that names no business component is the normal case, not a misconfiguration.
    var emptyClassLoader = new ClassLoader(null) {};
    assertThat(registry.authoredFrom(emptyClassLoader).hasNoComponents()).isTrue();
  }
}
