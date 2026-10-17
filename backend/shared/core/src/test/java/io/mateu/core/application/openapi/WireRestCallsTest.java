package io.mateu.core.application.openapi;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Arrays;
import java.util.List;
import org.junit.jupiter.api.Test;

/**
 * The contract is derived from rendered wire JSON as well (a YAML mount has no annotated class):
 * every option source, rows source and REST action found anywhere in the tree becomes a call, with
 * its placeholders typed by the form field they read and the response fields the screen reads.
 */
class WireRestCallsTest {

  private static final String FORM =
      """
      {"fragments":[{"component":{"metadata":{"type":"Form","children":[
        {"metadata":{"type":"FormField","fieldId":"since","dataType":"date"}},
        {"metadata":{"type":"FormField","fieldId":"qty","dataType":"integer"}},
        {"metadata":{"type":"FormField","fieldId":"country","dataType":"string",
          "optionsSource":{"url":"/api/countries?since=${state.since}","itemsPath":"data",
                           "valuePath":"code","labelPath":"name.common"}}},
        {"metadata":{"type":"FormField","fieldId":"city","dataType":"string",
          "optionsSource":{"ref":"cities","valuePath":"value","labelPath":"label"}}}
      ]}}}],
       "actions":[
        {"id":"__restdata__","restAction":{"resultPath":"me",
          "source":{"url":"/api/me","method":"get"}}},
        {"id":"order","restAction":{"source":{"url":"/api/orders","method":"post",
          "body":"{\\"qty\\": ${state.qty}}"}}},
        {"restAction":{"source":"not-an-object"}}
       ]}
      """;

  private static final String LISTING =
      """
      {"metadata":{"type":"Crud","id":"books",
        "rowsSource":{"url":"https://books.example.com/v1/books?q=${state.searchText}","itemsPath":"content"},
        "columns":[{"metadata":{"id":"title","dataType":"string"}},
                   {"metadata":{"id":"title","dataType":"string"}},
                   {"metadata":{"id":"pages","dataType":"integer"}},
                   {"metadata":{"label":"no id"}}]}}
      """;

  private static RestCall byKind(List<RestCall> calls, String kind, String declaredBy) {
    return calls.stream()
        .filter(c -> c.kind().equals(kind) && c.declaredBy().equals(declaredBy))
        .findFirst()
        .orElseThrow(() -> new AssertionError(kind + " by " + declaredBy + " in " + calls));
  }

  @Test
  void anOptionsSourceBecomesACallWithTypedPlaceholdersAndTheMappedPaths() {
    var calls = WireRestCalls.from(List.of(FORM));
    var countries = byKind(calls, "Options for a field", "country");
    assertThat(countries.url()).isEqualTo("/api/countries?since=${state.since}");
    assertThat(countries.method()).isEqualTo("GET");
    assertThat(countries.params())
        .containsExactly(new RestCall.Param("since", "string:date", true));
    assertThat(countries.response().itemsPath()).isEqualTo("data");
    assertThat(countries.response().collection()).isTrue();
    assertThat(countries.response().fields())
        .extracting(RestCall.Field::path)
        .containsExactly("code", "name.common");
  }

  @Test
  void aByRefOptionsSourceDoesNotClaimTheDefaultPathsAsFields() {
    var cities = byKind(WireRestCalls.from(List.of(FORM)), "Options for a field", "city");
    assertThat(cities.sourceName()).isEqualTo("cities");
    assertThat(cities.identity()).isEqualTo("source:cities");
    assertThat(cities.response().fields()).isEmpty();
  }

  @Test
  void restActionsAreActionsOrTheScreenData() {
    var calls = WireRestCalls.from(List.of(FORM));
    var me = byKind(calls, "Screen data", "__restdata__");
    assertThat(me.response().resultPath()).isEqualTo("me");
    assertThat(me.response().collection()).isFalse();

    var order = byKind(calls, "Action", "order");
    assertThat(order.method()).isEqualTo("POST");
    assertThat(order.params()).containsExactly(new RestCall.Param("qty", "integer:int64", true));
    assertThat(calls).hasSize(4);
  }

  @Test
  void aRowsSourceReadsTheListingColumnsOnceEach() {
    var books = byKind(WireRestCalls.from(List.of(LISTING)), "Listing rows", "books");
    assertThat(books.response().itemsPath()).isEqualTo("content");
    assertThat(books.response().fields())
        .containsExactly(
            new RestCall.Field("title", "string"), new RestCall.Field("pages", "integer:int64"));
    // a placeholder no field declares is a string
    assertThat(books.params()).containsExactly(new RestCall.Param("searchText", "string", true));
  }

  @Test
  void documentsThatAreMissingBlankOrNotJsonAreSkipped() {
    assertThat(WireRestCalls.from(null)).isEmpty();
    assertThat(WireRestCalls.from(Arrays.asList(null, "  ", "{not json", "[1, \"x\"]", LISTING)))
        .hasSize(1);
  }
}
