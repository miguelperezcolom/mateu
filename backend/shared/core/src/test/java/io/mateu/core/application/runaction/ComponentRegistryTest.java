package io.mateu.core.application.runaction;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.uidl.data.ComponentEntry;
import java.net.URLClassLoader;
import org.junit.jupiter.api.Test;

/**
 * The business-component catalogue registry (coherence-plan #13): the authored {@code
 * specs/ui/components.yaml} is read, its component trees parsed, and a reference resolves to the
 * named entry — the twin of {@link RestSourceRegistryTest}, one level up.
 *
 * <p>The fixture lives under {@code isolated-component-catalogue/} rather than the shared {@code
 * specs/ui/}: a catalogue on the SHARED test classpath would leak into every app the core suite
 * renders (it surfaces on {@code AppDto.components}), polluting the cross-language conformance
 * corpus. A URLClassLoader scoped to the isolated root gives the registry its conventional file
 * without that leak.
 */
class ComponentRegistryTest {

  private final ComponentRegistry registry = new ComponentRegistry();

  private ClassLoader isolated() {
    return new URLClassLoader(
        new java.net.URL[] {getClass().getResource("/isolated-component-catalogue/")},
        getClass().getClassLoader());
  }

  @Test
  void theAuthoredCatalogueIsReadFromTheConventionalFile() {
    var authored = registry.authoredFrom(isolated());
    assertThat(authored.components()).extracting(ComponentEntry::name).contains("AgencySelector");
    // the composition parsed to a fluent component (not left as raw YAML)
    assertThat(authored.get("AgencySelector")).isPresent();
    assertThat(authored.get("AgencySelector").orElseThrow().component()).isNotNull();
  }

  @Test
  void aReferenceResolvesThroughTheMergedCatalogue() {
    // load() merges authored over derived (no supplier beans in a bare test); the authored entry
    // is therefore resolvable by name — what a surface's ref will look up.
    var merged = registry.load(isolated());
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
