package io.mateu.core.application.openapi;

import io.mateu.uidl.data.RestSourceProvenance;
import java.util.ArrayList;
import java.util.List;

/**
 * One endpoint call a UI declares: where it goes, how, what it interpolates, and the shape it reads
 * back.
 *
 * <p>Every reader produces this — the source catalogue, the {@code @Rest*} annotations and rendered
 * wire JSON — so the document builder has ONE input regardless of which authoring channel declared
 * the call, and regardless of whether the declaration was code, YAML or a runtime supplier.
 *
 * @param sourceName the catalogue entry this came from, or blank for an inline declaration. When
 *     present it is the call's IDENTITY: two surfaces referencing one name are one operation,
 *     stated rather than guessed by comparing URLs.
 * @param provenance whether the project owes this endpoint or somebody else already serves it
 */
record RestCall(
    String sourceName,
    String url,
    String method,
    List<Param> params,
    ResponseShape response,
    String declaredBy,
    String kind,
    String summary,
    RestSourceProvenance provenance) {

  RestCall {
    sourceName = sourceName == null ? "" : sourceName;
    method = method == null || method.isBlank() ? "GET" : method.toUpperCase();
    params = params == null ? List.of() : List.copyOf(params);
    response = response == null ? ResponseShape.NONE : response;
    summary = summary == null ? "" : summary;
    provenance = provenance == null ? RestSourceProvenance.auto : provenance;
  }

  /** One value the screen interpolates into the request. */
  record Param(String name, String type, boolean required) {
    Param {
      type = type == null || type.isBlank() ? "string" : type;
    }

    static Param required(String name) {
      return new Param(name, "string", true);
    }
  }

  /**
   * One field the screen is known to read from the response, as the DOT PATH it lives at.
   *
   * <p>The path, not a name: a source may expose a nested field under a flat alias ({@code
   * customerName -> customer.name}), and the schema has to describe the endpoint's actual payload
   * rather than the alias the UI consumes it as. The builder nests the path.
   */
  record Field(String path, String type) {
    Field {
      type = type == null || type.isBlank() ? "string" : type;
    }
  }

  /**
   * What the screen reads back. A LOWER BOUND in the strict sense: these are the fields the UI is
   * known to touch, never the endpoint's full payload — which is why the emitted schema stays open
   * rather than declaring {@code additionalProperties: false}.
   *
   * @param itemsPath dot path to the array in the response; blank with fields present means the
   *     root IS the array
   * @param resultPath dot path to the object merged into form state (the data/action surfaces)
   * @param totalPath dot path to the total count, for an endpoint that pages server-side
   * @param collection whether the payload is a collection of items or a single object
   */
  record ResponseShape(
      String itemsPath,
      String resultPath,
      String totalPath,
      List<Field> fields,
      boolean collection) {

    static final ResponseShape NONE = new ResponseShape("", "", "", List.of(), false);

    ResponseShape {
      itemsPath = itemsPath == null ? "" : itemsPath;
      resultPath = resultPath == null ? "" : resultPath;
      totalPath = totalPath == null ? "" : totalPath;
      fields = fields == null ? List.of() : List.copyOf(fields);
    }

    static ResponseShape items(String itemsPath, String totalPath, List<Field> fields) {
      return new ResponseShape(itemsPath, "", totalPath, fields, true);
    }

    static ResponseShape result(String resultPath) {
      return new ResponseShape("", resultPath, "", List.of(), false);
    }

    /** The path the screen reads, for the human-readable description. */
    String readPath() {
      return itemsPath.isBlank() ? resultPath : itemsPath;
    }
  }

  /**
   * The identity two declarations of the same endpoint share. A catalogue name is exact; without
   * one the method and URL are all there is, which is why naming a source is what makes the derived
   * contract precise.
   */
  String identity() {
    return sourceName.isBlank() ? method + " " + url : "source:" + sourceName;
  }

  /**
   * The richer of two declarations of the same endpoint, merging what each knows.
   *
   * <p>A parameter only ONE of them sends stops being required: it is sent by some screen, not by
   * every screen, and a contract that demanded it would be over-claiming. The response fields are
   * unioned instead, because each screen reading a field is evidence the endpoint must return it.
   */
  RestCall mergedWith(RestCall other) {
    if (other == null) {
      return this;
    }
    // Whether the other declaration carried a REQUEST of its own. One that only names a source does
    // not: it has no url to read placeholders off, so its silence about a parameter is not evidence
    // that some screen omits it — and treating it as such would quietly turn every parameter
    // optional.
    var otherDeclaredRequest = other.url() != null && !other.url().isBlank();
    var params = new ArrayList<Param>();
    for (var mine : this.params) {
      var theirs = other.params.stream().filter(p -> p.name().equals(mine.name())).findFirst();
      params.add(
          new Param(
              mine.name(),
              "string".equals(mine.type()) && theirs.isPresent()
                  ? theirs.get().type()
                  : mine.type(),
              otherDeclaredRequest
                  ? mine.required() && theirs.map(Param::required).orElse(false)
                  : mine.required()));
    }
    for (var theirs : other.params) {
      if (params.stream().noneMatch(p -> p.name().equals(theirs.name()))) {
        params.add(new Param(theirs.name(), theirs.type(), false));
      }
    }

    var fields = new ArrayList<>(this.response.fields());
    for (var field : other.response.fields()) {
      if (fields.stream().noneMatch(f -> f.path().equals(field.path()))) {
        fields.add(field);
      }
    }
    var response =
        new ResponseShape(
            this.response.itemsPath().isBlank()
                ? other.response.itemsPath()
                : this.response.itemsPath(),
            this.response.resultPath().isBlank()
                ? other.response.resultPath()
                : this.response.resultPath(),
            this.response.totalPath().isBlank()
                ? other.response.totalPath()
                : this.response.totalPath(),
            fields,
            this.response.collection() || other.response.collection());

    return new RestCall(
        sourceName.isBlank() ? other.sourceName() : sourceName,
        url == null || url.isBlank() ? other.url() : url,
        method,
        params,
        response,
        declaredBy.equals(other.declaredBy()) ? declaredBy : declaredBy + ", " + other.declaredBy(),
        kind,
        summary.isBlank() ? other.summary() : summary,
        provenance == RestSourceProvenance.auto ? other.provenance() : provenance);
  }
}
