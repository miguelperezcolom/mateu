package io.mateu.core.application.openapi;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.JsonNode;
import io.mateu.uidl.annotations.RestListing;
import io.mateu.uidl.annotations.RestOptions;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.RestDataSource;
import io.mateu.uidl.data.RestSourceCatalog;
import io.mateu.uidl.data.RestSourceEntry;
import io.mateu.uidl.data.RestSourceProvenance;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

/**
 * Deriving the contract from every channel, not just from annotated Java.
 *
 * <p>What these pin is the part that decides whether the derivation is usable as an input to code
 * generation: that one endpoint is ONE operation however many channels declared it, that the
 * document says which endpoints this project owes, and that the response schema carries what the UI
 * actually reads instead of an untyped blob. A derivation that got any of those wrong would still
 * emit a plausible-looking file.
 */
class OpenApiDerivationTest {

  @SuppressWarnings("unused")
  @UI("/orders")
  @RestListing(source = "orders")
  static class Orders {

    LocalDate since;

    @RestOptions(url = "https://api.example.com/countries", valuePath = "code", labelPath = "name")
    String country;
  }

  private static RestSourceCatalog catalogue() {
    return new RestSourceCatalog(
        List.of(
            new RestSourceEntry(
                "orders",
                RestDataSource.builder()
                    .url("/api/orders?since=${state.since}")
                    .itemsPath("data")
                    .build(),
                RestSourceProvenance.auto,
                Map.of("customerName", "customer.name", "reference", "reference"),
                "meta.total",
                "The orders a screen lists"),
            new RestSourceEntry(
                "countries",
                RestDataSource.builder()
                    .url("https://restcountries.com/v3.1/all")
                    .valuePath("cca2")
                    .labelPath("name.common")
                    .build())));
  }

  private static JsonNode fromCatalogue() {
    return OpenApiEmitter.emit(
        "Test API", OpenApiEmitter.Declarations.ofViews(List.of()).withCatalogue(catalogue()));
  }

  @Test
  void aCataloguedSourceBecomesAnOperationIdentifiedByItsName() {
    // The name is the identity, so a generated server can be built around it instead of around a
    // name mangled out of a path.
    var operation = fromCatalogue().get("paths").get("/api/orders").get("get");
    assertThat(operation.get("operationId").asText()).isEqualTo("orders");
    assertThat(operation.get(OpenApiEmitter.SOURCE_EXTENSION).asText()).isEqualTo("orders");
    assertThat(operation.get("summary").asText()).isEqualTo("The orders a screen lists");
  }

  @Test
  void theDocumentSaysWhichEndpointsThisProjectHasToImplement() {
    var paths = fromCatalogue().get("paths");
    assertThat(
            paths.get("/api/orders").get("get").get(OpenApiEmitter.PROVENANCE_EXTENSION).asText())
        .isEqualTo("generate");
    assertThat(paths.get("/v3.1/all").get("get").get(OpenApiEmitter.PROVENANCE_EXTENSION).asText())
        .isEqualTo("existing");
  }

  @Test
  void anExternalOriginIsDescribedAsADependency() {
    var servers = fromCatalogue().get("servers");
    assertThat(servers.toString())
        .contains("An external dependency")
        .contains("https://restcountries.com");
  }

  @Test
  void aDeclaredProvenanceOverridesWhatTheUrlSuggests() {
    var owned =
        new RestSourceCatalog(
            List.of(
                new RestSourceEntry(
                    "invoices",
                    RestDataSource.builder().url("https://api.example.com/invoices").build(),
                    RestSourceProvenance.generate,
                    Map.of(),
                    "",
                    "")));
    var document =
        OpenApiEmitter.emit(
            "x", OpenApiEmitter.Declarations.ofViews(List.of()).withCatalogue(owned));
    assertThat(
            document
                .get("paths")
                .get("/invoices")
                .get("get")
                .get(OpenApiEmitter.PROVENANCE_EXTENSION)
                .asText())
        .isEqualTo("generate");
  }

  @Test
  void theFieldMapBecomesANestedResponseSchema() {
    // The schema must describe the ENDPOINT's payload, not the flat alias the UI reads it under:
    // the
    // server returns customer.name, and a schema claiming a top-level customerName would be wrong.
    var schema =
        fromCatalogue()
            .get("paths")
            .get("/api/orders")
            .get("get")
            .get("responses")
            .get("200")
            .get("content")
            .get("application/json")
            .get("schema");
    var items = schema.get("properties").get("data");
    assertThat(items.get("type").asText()).isEqualTo("array");
    var itemProperties = items.get("items").get("properties");
    assertThat(itemProperties.get("customer").get("properties").has("name")).isTrue();
    assertThat(itemProperties.has("reference")).isTrue();
    assertThat(itemProperties.has("customerName")).isFalse();
  }

  @Test
  void aServerPagedSourceCarriesItsTotalInTheEnvelope() {
    var schema =
        fromCatalogue()
            .get("paths")
            .get("/api/orders")
            .get("get")
            .get("responses")
            .get("200")
            .get("content")
            .get("application/json")
            .get("schema");
    assertThat(
            schema
                .get("properties")
                .get("meta")
                .get("properties")
                .get("total")
                .get("type")
                .asText())
        .isEqualTo("integer");
  }

  @Test
  void aSurfaceReferencingASourceIsTheSameOperationAsTheCatalogueEntry() {
    // Orders declares @RestListing(source = "orders"); without identity by name it would emit a
    // second, poorer operation for the same endpoint.
    var document =
        OpenApiEmitter.emit(
            "x",
            OpenApiEmitter.Declarations.ofViews(List.of(Orders.class)).withCatalogue(catalogue()));
    var operations = document.get("paths").get("/api/orders");
    assertThat(operations).hasSize(1);
    assertThat(operations.get("get").get("operationId").asText()).isEqualTo("orders");
  }

  @Test
  void aReferenceWithNoCatalogueEntryEmitsNothingRatherThanAnEmptyPath() {
    // It names an endpoint nobody described, so there is nothing truthful to say about it.
    var document =
        OpenApiEmitter.emit("x", OpenApiEmitter.Declarations.ofViews(List.of(Orders.class)));
    assertThat(document.get("paths").has("/api/orders")).isFalse();
    assertThat(document.get("paths").has("/countries")).isTrue();
  }

  @Test
  void aParameterIsTypedFromTheFieldItNames() {
    // `${state.since}` names a LocalDate field, so the parameter is a date rather than a bare
    // string
    // — which is what decides the type a generated server takes.
    var document =
        OpenApiEmitter.emit(
            "x",
            OpenApiEmitter.Declarations.ofViews(List.of(Orders.class)).withCatalogue(catalogue()));
    var parameters = document.get("paths").get("/api/orders").get("get").get("parameters");
    assertThat(parameters.get(0).get("name").asText()).isEqualTo("since");
    assertThat(parameters.get(0).get("schema").get("type").asText()).isEqualTo("string");
    assertThat(parameters.get(0).get("schema").get("format").asText()).isEqualTo("date");
  }

  // ── Reading a RENDERED ui, which is the channel-independent one ──────────────────────────────

  private static final String WIRE =
      """
      {"fragments": [{"component": {"type": "ClientSide", "metadata": {"type": "Crud",
        "rowsSource": {"url": "/api/products?q=${searchText}", "itemsPath": "items"},
        "columns": [
          {"type": "ClientSide", "metadata": {"type": "GridColumn", "id": "code", "dataType": "string"}},
          {"type": "ClientSide", "metadata": {"type": "GridColumn", "id": "price", "dataType": "money"}}
        ],
        "filters": [{"fieldId": "searchText", "dataType": "string"}]}}}]}
      """;

  private static JsonNode fromWire() {
    return OpenApiEmitter.emit(
        "x", OpenApiEmitter.Declarations.ofViews(List.of()).withWireDocuments(List.of(WIRE)));
  }

  @Test
  void anEndpointDeclaredOnlyInRenderedWireStillReachesTheContract() {
    // This is the case a YAML-authored mount is: no annotated class contributes anything, and the
    // whole contract still comes out — which is what lets a static bundle derive its own API.
    assertThat(fromWire().get("paths").has("/api/products")).isTrue();
  }

  @Test
  void aListingsColumnsBecomeTheFieldsOfEachRow() {
    var schema =
        fromWire()
            .get("paths")
            .get("/api/products")
            .get("get")
            .get("responses")
            .get("200")
            .get("content")
            .get("application/json")
            .get("schema");
    var itemProperties = schema.get("properties").get("items").get("items").get("properties");
    assertThat(itemProperties.get("code").get("type").asText()).isEqualTo("string");
    assertThat(itemProperties.get("price").get("type").asText()).isEqualTo("number");
  }

  @Test
  void theSameEndpointReachingTheEmitterTwiceIsOneOperation() {
    var document =
        OpenApiEmitter.emit(
            "x",
            new OpenApiEmitter.Declarations(List.of(Orders.class), List.of(WIRE), catalogue()));
    assertThat(document.get("paths").get("/api/orders")).hasSize(1);
    assertThat(document.get("paths").get("/api/products")).hasSize(1);
  }

  @Test
  void theResponseSchemaIsOpenBecauseTheUiOnlyKnowsWhatItReads() {
    // Declaring it closed would turn a lower bound into a false claim about the endpoint.
    assertThat(fromCatalogue().toString()).doesNotContain("additionalProperties");
  }
}
