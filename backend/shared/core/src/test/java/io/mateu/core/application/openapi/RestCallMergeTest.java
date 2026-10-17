package io.mateu.core.application.openapi;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.uidl.data.RestSourceProvenance;
import java.util.List;
import org.junit.jupiter.api.Test;

/**
 * Two screens calling the same endpoint are ONE operation in the derived contract, and the merge is
 * what makes it honest: a parameter only some screens send is optional, a typed declaration beats
 * an untyped one, every field any screen reads is in the response, and a declaration that only
 * NAMES the source says nothing about which parameters are required.
 */
class RestCallMergeTest {

  private static RestCall call(
      String source,
      String url,
      List<RestCall.Param> params,
      RestCall.ResponseShape response,
      String declaredBy,
      String summary,
      RestSourceProvenance provenance) {
    return new RestCall(
        source, url, "get", params, response, declaredBy, "Listing rows", summary, provenance);
  }

  @Test
  void aParameterOnlyOneScreenSendsIsOptionalAndTheTypedDeclarationWins() {
    var a =
        call(
            "",
            "/api/books?id=${state.id}&q=${state.q}",
            List.of(
                new RestCall.Param("id", "string", true), new RestCall.Param("q", "string", true)),
            RestCall.ResponseShape.items("", "", List.of(new RestCall.Field("title", "string"))),
            "BooksScreen",
            "",
            RestSourceProvenance.auto);
    var b =
        call(
            "",
            "/api/books?id=${state.id}&page=${state.page}",
            List.of(
                new RestCall.Param("id", "integer:int64", true),
                new RestCall.Param("page", "integer:int64", true)),
            RestCall.ResponseShape.items(
                "content", "meta.total", List.of(new RestCall.Field("pages", "integer:int64"))),
            "ShelfScreen",
            "Books on a shelf",
            RestSourceProvenance.generate);

    assertThat(a.identity()).isEqualTo("GET /api/books?id=${state.id}&q=${state.q}");
    var merged = a.mergedWith(b);

    assertThat(merged.params())
        .containsExactly(
            new RestCall.Param("id", "integer:int64", true),
            new RestCall.Param("q", "string", false),
            new RestCall.Param("page", "integer:int64", false));
    assertThat(merged.response().fields())
        .extracting(RestCall.Field::path)
        .containsExactly("title", "pages");
    assertThat(merged.response().itemsPath()).isEqualTo("content");
    assertThat(merged.response().totalPath()).isEqualTo("meta.total");
    assertThat(merged.response().readPath()).isEqualTo("content");
    assertThat(merged.response().collection()).isTrue();
    assertThat(merged.declaredBy()).isEqualTo("BooksScreen, ShelfScreen");
    assertThat(merged.summary()).isEqualTo("Books on a shelf");
    assertThat(merged.provenance()).isEqualTo(RestSourceProvenance.generate);
    assertThat(merged.method()).isEqualTo("GET");
  }

  @Test
  void aDeclarationThatOnlyNamesTheSourceKeepsTheCatalogueParametersRequired() {
    var catalogue =
        call(
            "books",
            "/api/books/${state.id}",
            List.of(new RestCall.Param("id", "string", true)),
            RestCall.ResponseShape.result("data"),
            "sources.yaml",
            "One book",
            RestSourceProvenance.existing);
    var byRef =
        call(
            "books",
            "",
            List.of(),
            RestCall.ResponseShape.NONE,
            "sources.yaml",
            "",
            RestSourceProvenance.auto);

    var merged = catalogue.mergedWith(byRef);
    assertThat(merged.identity()).isEqualTo("source:books");
    assertThat(merged.params()).containsExactly(new RestCall.Param("id", "string", true));
    assertThat(merged.url()).isEqualTo("/api/books/${state.id}");
    assertThat(merged.response().resultPath()).isEqualTo("data");
    assertThat(merged.response().readPath()).isEqualTo("data");
    assertThat(merged.declaredBy()).isEqualTo("sources.yaml");
    assertThat(merged.provenance()).isEqualTo(RestSourceProvenance.existing);

    // the other way round: the url and the name come from whichever declaration has them
    var reversed = byRef.mergedWith(catalogue);
    assertThat(reversed.url()).isEqualTo("/api/books/${state.id}");
    assertThat(reversed.summary()).isEqualTo("One book");
    assertThat(reversed.response().resultPath()).isEqualTo("data");
    assertThat(reversed.mergedWith(null)).isSameAs(reversed);
  }

  @Test
  void blankPartsAreNormalised() {
    var bare = new RestCall(null, "/x", " ", null, null, "a", "k", null, null);
    assertThat(bare.sourceName()).isEmpty();
    assertThat(bare.method()).isEqualTo("GET");
    assertThat(bare.params()).isEmpty();
    assertThat(bare.response()).isEqualTo(RestCall.ResponseShape.NONE);
    assertThat(bare.provenance()).isEqualTo(RestSourceProvenance.auto);
    assertThat(new RestCall.Param("p", " ", true).type()).isEqualTo("string");
    assertThat(new RestCall.Field("f", null).type()).isEqualTo("string");
    assertThat(RestCall.Param.required("p")).isEqualTo(new RestCall.Param("p", "string", true));
  }
}
