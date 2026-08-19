package io.mateu.core.application.runaction;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.uidl.annotations.RestSource;
import io.mateu.uidl.data.RestDataSource;
import io.mateu.uidl.data.RestSourceCatalog;
import io.mateu.uidl.data.RestSourceEntry;
import io.mateu.uidl.data.RestSourceProvenance;
import java.util.List;
import org.junit.jupiter.api.Test;

/**
 * The catalogue of named REST sources.
 *
 * <p>What these pin is not that entries come out, but the two properties the whole indirection
 * rests on: that a name resolves to ONE endpoint however it was declared, and that the catalogue
 * can say which endpoints this project owes versus which somebody else already serves. Get the
 * second one wrong and the derived contract either generates a controller for a third party's API
 * or silently omits an endpoint the UI depends on.
 */
class RestSourceRegistryTest {

  private final RestSourceRegistry registry = new RestSourceRegistry();

  @RestSource(
      name = "countries",
      url = "https://restcountries.com/v3.1/all",
      valuePath = "cca2",
      labelPath = "name.common",
      headers = {"Accept: application/json"},
      description = "ISO country codes")
  @RestSource(
      name = "orders",
      url = "/api/orders",
      itemsPath = "data",
      totalPath = "meta.total",
      fields = {"customerName=customer.name", "total=amount.gross"})
  private static class Annotated {}

  private static RestSourceEntry entryOf(String name) {
    for (var annotation : Annotated.class.getAnnotationsByType(RestSource.class)) {
      if (name.equals(annotation.name())) {
        return RestSourceRegistry.entryOf(annotation);
      }
    }
    return null;
  }

  @Test
  void anAnnotationBecomesACatalogueEntryWithItsRequestAndItsMapping() {
    var entry = entryOf("countries");
    assertThat(entry.name()).isEqualTo("countries");
    assertThat(entry.source().url()).isEqualTo("https://restcountries.com/v3.1/all");
    assertThat(entry.source().valuePath()).isEqualTo("cca2");
    assertThat(entry.source().labelPath()).isEqualTo("name.common");
    assertThat(entry.source().headers()).containsEntry("Accept", "application/json");
    assertThat(entry.description()).isEqualTo("ISO country codes");
  }

  @Test
  void theFieldMapLetsANestedResponseFieldBeReadUnderAFlatName() {
    // The gap a surface cannot close on its own: a column id is used directly as the dot path, and
    // a record field cannot be called `customer.name`.
    var entry = entryOf("orders");
    assertThat(entry.fields())
        .containsEntry("customerName", "customer.name")
        .containsEntry("total", "amount.gross");
    assertThat(entry.pathOf("customerName")).isEqualTo("customer.name");
  }

  @Test
  void anUnmappedNameIsItsOwnPath() {
    // So a surface naming a response field directly keeps working with no entry for it.
    assertThat(entryOf("orders").pathOf("reference")).isEqualTo("reference");
  }

  @Test
  void aRelativeUrlIsOursToBuildAndAnAbsoluteOneIsSomebodyElses() {
    assertThat(entryOf("orders").effectiveProvenance()).isEqualTo(RestSourceProvenance.generate);
    assertThat(entryOf("countries").effectiveProvenance()).isEqualTo(RestSourceProvenance.existing);
  }

  @Test
  void aDeclaredProvenanceWinsOverTheInference() {
    var declared =
        new RestSourceEntry(
            "invoices",
            RestDataSource.builder().url("https://api.example.com/invoices").build(),
            RestSourceProvenance.generate,
            java.util.Map.of(),
            "",
            "");
    assertThat(declared.effectiveProvenance()).isEqualTo(RestSourceProvenance.generate);
  }

  @Test
  void theAuthoredCatalogueIsReadFromTheConventionalFile() {
    var authored = registry.authoredFrom(getClass().getClassLoader());
    assertThat(authored.sources())
        .extracting(RestSourceEntry::name)
        .containsExactly("countries", "orders", "invoices");
    assertThat(authored.get("orders").orElseThrow().source().itemsPath()).isEqualTo("data");
    assertThat(authored.get("orders").orElseThrow().totalPath()).isEqualTo("meta.total");
    assertThat(authored.get("orders").orElseThrow().fields())
        .containsEntry("customerName", "customer.name");
  }

  @Test
  void noCatalogueFileIsNotAnError() {
    // An app that names no source is the normal case, not a misconfiguration.
    var emptyClassLoader = new ClassLoader(null) {};
    assertThat(registry.authoredFrom(emptyClassLoader).isEmpty()).isTrue();
  }

  @Test
  void anAuthoredEntryReplacesTheDerivedOneOfTheSameName() {
    // Explicit beats derived, and it replaces outright: a half-overridden endpoint would be harder
    // to reason about than a replaced one.
    var derived =
        new RestSourceCatalog(
            List.of(
                new RestSourceEntry("countries", RestDataSource.builder().url("/derived").build()),
                new RestSourceEntry(
                    "only-derived", RestDataSource.builder().url("/kept").build())));
    var authored =
        new RestSourceCatalog(
            List.of(
                new RestSourceEntry(
                    "countries", RestDataSource.builder().url("/authored").build())));

    var merged = authored.mergedOver(derived);

    assertThat(merged.get("countries").orElseThrow().source().url()).isEqualTo("/authored");
    assertThat(merged.get("only-derived").orElseThrow().source().url()).isEqualTo("/kept");
  }

  @Test
  void theCatalogueSeparatesWhatWeOweFromWhatWeOnlyConsume() {
    // This is what the server generator reads, and what must never generate a controller for a
    // third party's endpoint.
    var catalogue = registry.authoredFrom(getClass().getClassLoader());
    assertThat(catalogue.toImplement())
        .extracting(RestSourceEntry::name)
        .containsExactly("orders", "invoices");
    assertThat(catalogue.consumed()).extracting(RestSourceEntry::name).containsExactly("countries");
  }

  @Test
  void aReferenceTakesTheEndpointFromTheEntryButKeepsWhatTheSurfaceDeclared() {
    // A surface may point at a shared source and still map the response its own way.
    var entry =
        new RestSourceEntry(
            "countries",
            RestDataSource.builder()
                .url("https://restcountries.com/v3.1/all")
                .itemsPath("data")
                .valuePath("cca2")
                .labelPath("name.common")
                .build());
    var surface = RestDataSource.builder().ref("countries").labelPath("name.official").build();

    var resolved = surface.resolvedAgainst(entry);

    assertThat(resolved.url()).isEqualTo("https://restcountries.com/v3.1/all");
    assertThat(resolved.itemsPath()).isEqualTo("data");
    assertThat(resolved.valuePath()).isEqualTo("cca2");
    assertThat(resolved.labelPath()).isEqualTo("name.official");
    assertThat(resolved.ref()).isEqualTo("countries");
  }

  @Test
  void anInlineDescriptorIsNotAReference() {
    assertThat(RestDataSource.builder().url("/x").build().isReference()).isFalse();
    assertThat(RestDataSource.builder().ref("countries").build().isReference()).isTrue();
  }
}
