package io.mateu.uidl.data;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

/**
 * What of a REST source reaches the browser: a PROXIED source is called by the server from its own
 * table, so its headers and body template (where `${secret.X}` lives) never travel; a direct one
 * travels whole, since the browser is the one calling it.
 */
class RestSourcesForTheClientTest {

  private static final RestDataSource PROXIED =
      new RestDataSource(
          "",
          "https://api.example.com/orders",
          "POST",
          Map.of("X-Api-Key", "${secret.KEY}"),
          "{\"q\":\"${state.q}\"}",
          "content",
          "id",
          "name",
          true);

  private static final RestDataSource DIRECT =
      new RestDataSource(
          "",
          "https://api.example.com/countries",
          "GET",
          Map.of("Accept", "x"),
          null,
          null,
          null,
          null,
          false);

  @Test
  void aProxiedSourceTravelsWithoutItsHeadersAndBody() {
    var client = PROXIED.forTheClient();
    assertThat(client.headers()).isNull();
    assertThat(client.body()).isNull();
    assertThat(client.url()).isEqualTo(PROXIED.url());
    assertThat(client.itemsPath()).isEqualTo("content");
    assertThat(client.proxy()).isTrue();
  }

  @Test
  void aDirectSourceOrAProxiedOneWithNothingToHideTravelsAsItIs() {
    assertThat(DIRECT.forTheClient()).isSameAs(DIRECT);
    var bare = new RestDataSource("", "https://x", "GET", null, null, null, null, null, true);
    assertThat(bare.forTheClient()).isSameAs(bare);
  }

  @Test
  void theCatalogueForTheClientStripsEveryProxiedEntryAndKeepsTheRest() {
    var catalog =
        new RestSourceCatalog(
            List.of(
                new RestSourceEntry(
                    "orders",
                    PROXIED,
                    null,
                    Map.of("customer", "customer.name"),
                    "totalElements",
                    "Orders",
                    null,
                    null),
                new RestSourceEntry("countries", DIRECT, null, null, null, null, null, null),
                new RestSourceEntry("empty", null, null, null, null, null, null, null)));
    var client = catalog.forTheClient();
    var orders = client.get("orders").orElseThrow();
    assertThat(orders.source().headers()).isNull();
    assertThat(orders.source().body()).isNull();
    assertThat(orders.fields()).containsEntry("customer", "customer.name");
    assertThat(orders.totalPath()).isEqualTo("totalElements");
    assertThat(orders.description()).isEqualTo("Orders");
    assertThat(client.get("countries").orElseThrow().source()).isEqualTo(DIRECT);
    assertThat(client.get("empty").orElseThrow().source()).isNull();
    assertThat(client.get(" ")).isEmpty();
    assertThat(client.get(null)).isEmpty();
  }

  @Test
  void samplesAreStrippedAndAuthoredEntriesReplaceDerivedOnes() {
    var withSample = DIRECT.withSample(List.of(Map.of("id", 1)));
    assertThat(withSample.carriesSample()).isTrue();
    var catalog =
        new RestSourceCatalog(
            List.of(
                new RestSourceEntry(
                    "countries",
                    withSample,
                    null,
                    null,
                    null,
                    null,
                    List.of(Map.of("id", 2)),
                    null)));
    var stripped = catalog.strippedOfSamples().get("countries").orElseThrow();
    assertThat(stripped.source().sample()).isNull();
    assertThat(stripped.sample()).isNull();

    var derived =
        new RestSourceCatalog(
            List.of(
                new RestSourceEntry("countries", PROXIED, null, null, null, null, null, null),
                new RestSourceEntry("other", DIRECT, null, null, null, null, null, null)));
    var merged = catalog.mergedOver(derived);
    assertThat(merged.sources())
        .extracting(RestSourceEntry::name)
        .containsExactly("countries", "other");
    assertThat(merged.get("countries").orElseThrow().source()).isEqualTo(withSample);
    assertThat(catalog.mergedOver(null).sources()).hasSize(1);
    assertThat(RestSourceCatalog.empty().hasNoSources()).isTrue();
  }

  @Test
  void aReferenceIsResolvedAgainstItsCatalogueEntryWhatItDeclaresWinning() {
    var ref = RestDataSource.ref(" orders ");
    assertThat(ref.hasRef()).isTrue();
    assertThat(ref.ref()).isEqualTo("orders");
    var entry = new RestSourceEntry("orders", PROXIED, null, null, null, null, null, null);
    var resolved = ref.resolvedAgainst(entry);
    assertThat(resolved.url()).isEqualTo(PROXIED.url());
    assertThat(resolved.method()).isEqualTo("POST");
    assertThat(resolved.headers()).isEqualTo(PROXIED.headers());
    assertThat(resolved.proxy()).isTrue();
    assertThat(ref.resolvedAgainst(null)).isSameAs(ref);

    var own =
        new RestDataSource(
            "orders", "https://own", "GET", Map.of("A", "b"), "x", "items", "v", "l", false);
    var keeps = own.resolvedAgainst(entry);
    assertThat(keeps.url()).isEqualTo("https://own");
    assertThat(keeps.headers()).containsEntry("A", "b");
    assertThat(keeps.itemsPath()).isEqualTo("items");
  }
}
