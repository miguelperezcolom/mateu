package io.mateu.core.application.runaction;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.uidl.annotations.RestAction;
import io.mateu.uidl.annotations.RestData;
import io.mateu.uidl.annotations.RestListing;
import io.mateu.uidl.annotations.RestOptions;
import io.mateu.uidl.data.RestDataSource;
import io.mateu.uidl.data.RestSourceCatalog;
import io.mateu.uidl.data.RestSourceEntry;
import io.mateu.uidl.data.RestSourceProvenance;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

/**
 * Every surface a proxy fetch can be declared on — {@code @RestListing} (rows), {@code @RestData}
 * (data), {@code @RestAction} (an action method), {@code @RestOptions} (a field) — resolves to what
 * the annotation says, headers included; and a by-REF declaration takes the endpoint from the
 * server's catalogue, including its {@code proxy} flag (the gotcha that once sent a proxied call
 * from the browser, without its secret).
 */
class RestSourceResolverDeclarationsTest {

  @RestListing(
      url = "https://api.example.com/books",
      itemsPath = "content",
      headers = {"Accept: application/json", "X-Tenant:  acme ", "malformed"},
      proxy = true)
  @RestData(url = "https://api.example.com/me", method = "PUT", body = "{}")
  public static class Annotated {
    @RestOptions(source = "countries")
    String country;

    @RestOptions(url = "https://api.example.com/cities", valuePath = "id", labelPath = "name")
    String city;

    String plain;

    @RestAction(url = "https://api.example.com/books/${state.id}", method = "DELETE")
    public void remove() {}

    @RestAction(source = "publish")
    public void publish() {}

    public void notRest() {}
  }

  public static class Parent {
    @RestOptions(url = "https://api.example.com/inherited")
    String inherited;
  }

  public static class Child extends Parent {}

  private static final RestSourceCatalog CATALOG =
      new RestSourceCatalog(
          List.of(
              new RestSourceEntry(
                  "countries",
                  RestDataSource.builder()
                      .url("https://geo.example.com/countries?key=${secret.GEO}")
                      .method("GET")
                      .itemsPath("data")
                      .proxy(true)
                      .build(),
                  RestSourceProvenance.existing,
                  Map.of(),
                  "",
                  "")));

  @Test
  void aListingClassResolvesItsRowsSourceWithParsedHeaders() {
    var rows = RestSourceResolver.resolve(new Annotated(), "rows", "", CATALOG);
    assertThat(rows.url()).isEqualTo("https://api.example.com/books");
    assertThat(rows.method()).isEqualTo("GET");
    assertThat(rows.itemsPath()).isEqualTo("content");
    assertThat(rows.proxy()).isTrue();
    // "Name: value" pairs, trimmed; an entry without a colon is not a header
    assertThat(rows.headers())
        .containsExactly(Map.entry("Accept", "application/json"), Map.entry("X-Tenant", "acme"));
  }

  @Test
  void theDataSourceKeepsItsDeclaredMethodAndBody() {
    var data = RestSourceResolver.resolve(new Annotated(), "data", null, CATALOG);
    assertThat(data.url()).isEqualTo("https://api.example.com/me");
    assertThat(data.method()).isEqualTo("PUT");
    assertThat(data.body()).isEqualTo("{}");
    assertThat(data.proxy()).isFalse();
  }

  @Test
  void anActionMethodResolvesItsDeclaredCall() {
    var action = RestSourceResolver.resolve(new Annotated(), "action", "remove", CATALOG);
    assertThat(action.url()).isEqualTo("https://api.example.com/books/${state.id}");
    assertThat(action.method()).isEqualTo("DELETE");
  }

  @Test
  void anOptionsFieldResolvesItsMappingPathsAndSearchesSuperclasses() {
    var city = RestSourceResolver.resolve(new Annotated(), "options", "city", CATALOG);
    assertThat(city.url()).isEqualTo("https://api.example.com/cities");
    assertThat(city.valuePath()).isEqualTo("id");
    assertThat(city.labelPath()).isEqualTo("name");

    var inherited = RestSourceResolver.resolve(new Child(), "options", "inherited", CATALOG);
    assertThat(inherited.url()).isEqualTo("https://api.example.com/inherited");
  }

  @Test
  void aByRefDeclarationTakesTheEndpointAndTheProxyFlagFromTheCatalogue() {
    var country = RestSourceResolver.resolve(new Annotated(), "options", "country", CATALOG);
    assertThat(country.ref()).isEqualTo("countries");
    assertThat(country.url()).isEqualTo("https://geo.example.com/countries?key=${secret.GEO}");
    assertThat(country.itemsPath()).isEqualTo("data");
    assertThat(country.proxy()).as("proxy is read off the RESOLVED source").isTrue();
  }

  @Test
  void aRefTheCatalogueDoesNotCarryResolvesToNoEndpoint() {
    var publish = RestSourceResolver.resolve(new Annotated(), "action", "publish", CATALOG);
    assertThat(publish.ref()).isEqualTo("publish");
    assertThat(publish.url()).isNullOrEmpty();

    var withoutCatalogue = RestSourceResolver.resolve(new Annotated(), "options", "country", null);
    assertThat(withoutCatalogue.ref()).isEqualTo("countries");
    assertThat(withoutCatalogue.url()).isNullOrEmpty();
  }

  @Test
  void undeclaredSurfacesAndUnknownKindsResolveToNothing() {
    assertThat(RestSourceResolver.resolve(new Annotated(), "options", "plain", CATALOG)).isNull();
    assertThat(RestSourceResolver.resolve(new Annotated(), "options", "nope", CATALOG)).isNull();
    assertThat(RestSourceResolver.resolve(new Annotated(), "action", "notRest", CATALOG)).isNull();
    assertThat(RestSourceResolver.resolve(new Annotated(), "action", "nope", CATALOG)).isNull();
    assertThat(RestSourceResolver.resolve(new Annotated(), "upload", "x", CATALOG)).isNull();
    assertThat(RestSourceResolver.resolve(new Annotated(), null, "x", CATALOG)).isNull();
    assertThat(RestSourceResolver.resolve(new Child(), "rows", "", CATALOG)).isNull();
    assertThat(RestSourceResolver.resolve(new Child(), "data", "", CATALOG)).isNull();
  }
}
