package io.mateu.core.application.openapi;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import org.junit.jupiter.api.Test;

/**
 * The {@code server} goal works on ANY OpenAPI document, not only on the one Mateu derives: every
 * HTTP method gets its mapping, an operation without an id is named from its method and path, two
 * operations of one group never share a name, parameters and responses are typed, and only the
 * operations of the wanted provenance are built.
 */
class ServerSkeletonFromAnyDocumentTest {

  static final String DOC =
      """
      {"openapi":"3.0.3","paths":{
        "/api/books/{id}":{
          "put":{"parameters":[{"name":"id","in":"path","required":true,"schema":{"type":"integer","format":"int64"}}],
                 "responses":{"200":{"content":{"application/json":{"schema":{"type":"object","properties":{"title":{"type":"string"}}}}}}}},
          "patch":{"summary":"Rename","parameters":[{"name":"id","in":"path","required":true,"schema":{"type":"integer"}},
                                                    {"name":"title","in":"query","schema":{"type":"string"}}]},
          "delete":{"operationId":"removeBook","parameters":[{"name":"id","in":"path","required":true,"schema":{"type":"string"}},{"in":"query"}]}
        },
        "/api/books":{
          "get":{"operationId":"list","summary":"All books","x-mateu-provenance":"generate",
                 "responses":{"200":{"content":{"application/json":{"schema":{"type":"array","items":{"type":"integer"}}}}}}}
        },
        "/api/books/search":{
          "get":{"operationId":"list","parameters":[{"name":"since","in":"query","schema":{"type":"string","format":"date"}}]}
        },
        "/api/partners":{
          "get":{"operationId":"partners","x-mateu-provenance":"existing"}
        }
      }}
      """;

  private static final ObjectMapper JSON = new ObjectMapper();

  private static List<ServerSkeleton.GeneratedFile> generate(String provenance) throws Exception {
    JsonNode doc = JSON.readTree(DOC);
    return ServerSkeleton.generate(
        doc, new ServerSkeleton.Options(null, null, null, null, null, null, provenance));
  }

  private static String file(List<ServerSkeleton.GeneratedFile> files, String suffix) {
    return files.stream()
        .filter(f -> f.path().endsWith(suffix))
        .map(ServerSkeleton.GeneratedFile::content)
        .findFirst()
        .orElseThrow(() -> new AssertionError("not generated: " + suffix));
  }

  @Test
  void blankOptionsFallBackToARunnableDefaultModule() throws Exception {
    var files = generate(null);
    assertThat(files)
        .extracting(ServerSkeleton.GeneratedFile::path)
        .contains(
            "pom.xml",
            "src/main/java/com/example/apiServer/Application.java",
            "src/main/java/com/example/apiServer/api/BooksApi.java",
            "src/main/java/com/example/apiServer/api/BooksController.java",
            "src/main/java/com/example/apiServer/api/model/PutApiBooksResponse.java",
            "src/main/resources/META-INF/spring.factories");
    assertThat(file(files, "pom.xml")).contains("<artifactId>api-server</artifactId>");
  }

  @Test
  void everyHttpMethodGetsItsMappingAndOperationsWithoutAnIdAreNamedFromTheirPath()
      throws Exception {
    var controller = file(generate("generate"), "BooksController.java");
    assertThat(controller)
        .contains("@PutMapping(\"/api/books/{id}\")", "public PutApiBooksResponse putApiBooks(")
        .contains("@PatchMapping(\"/api/books/{id}\")", "patchApiBooks(")
        .contains("@DeleteMapping(\"/api/books/{id}\")", "removeBook(")
        .contains("@GetMapping(\"/api/books\")", "public List<Integer> list()")
        // a second operation with the same id in the same group is numbered, never overwritten
        .contains("@GetMapping(\"/api/books/search\")", "list2(");
  }

  @Test
  void thePortDeclaresTypedParametersAndTheReturnTypeEachResponseImplies() throws Exception {
    var port = file(generate("generate"), "BooksApi.java");
    assertThat(port)
        .contains("public interface BooksApi")
        .contains("PutApiBooksResponse putApiBooks(Long id);")
        .contains("/** Rename */", "Map<String, Object> patchApiBooks(Integer id, String title);")
        .contains("Map<String, Object> removeBook(String id);")
        .contains("/** All books */", "List<Integer> list();")
        .contains("/** GET /api/books/search */", "Map<String, Object> list2(LocalDate since);")
        .contains("import java.time.LocalDate;", "import java.util.List;");
    var controller = file(generate("generate"), "BooksController.java");
    assertThat(controller)
        .contains("@RequestParam(name = \"title\", required = false) String title")
        .contains("@RequestParam(name = \"since\", required = false) LocalDate since");
    assertThat(file(generate("generate"), "README.md"))
        .contains("`Map<String, Object> list2(...)` — GET `/api/books/search`")
        .contains("— PATCH `/api/books/{id}` — Rename");
  }

  @Test
  void onlyTheOperationsOfTheWantedProvenanceAreBuilt() throws Exception {
    var ours = generate("generate");
    assertThat(ours)
        .extracting(ServerSkeleton.GeneratedFile::path)
        .noneMatch(p -> p.contains("Partners"));

    var theirs = generate("existing");
    assertThat(theirs)
        .extracting(ServerSkeleton.GeneratedFile::path)
        .contains("src/main/java/com/example/apiServer/api/PartnersApi.java")
        .noneMatch(p -> p.contains("BooksApi"));

    var all = generate("all");
    assertThat(all)
        .extracting(ServerSkeleton.GeneratedFile::path)
        .contains(
            "src/main/java/com/example/apiServer/api/PartnersApi.java",
            "src/main/java/com/example/apiServer/api/BooksApi.java");

    assertThat(
            ServerSkeleton.generate(
                JSON.readTree("{}"),
                new ServerSkeleton.Options(null, null, null, null, null, null, null)))
        .isEmpty();
  }
}
