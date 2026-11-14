package io.mateu.core.application.mcp;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.core.testutil.FakeHttpRequest;
import io.mateu.core.testutil.TestMateu;
import io.mateu.uidl.annotations.EditableOnlyWhenCreating;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.interfaces.CrudStore;
import io.mateu.uidl.interfaces.Identifiable;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/**
 * The actions a crud's record pages list (the creation form's Create, the editor's Save) are the
 * CRUD's, not the page's: in the browser they bubble from the page to the crud, which runs them.
 * {@code mateu_run_action} sent them to the page's own type (the entity), which has no such method
 * — "Refused action 'create' on …Product: no such action" — so an agent could see Create on
 * products/new and never press it.
 */
class McpCrudActionsSyncTest {

  public record Product(@EditableOnlyWhenCreating String id, String name) implements Identifiable {}

  static final Map<String, Product> STORE = new LinkedHashMap<>();

  @Title("Products")
  public static class Products extends AutoCrud<Product> {
    @Override
    public CrudStore<Product> store() {
      return new CrudStore<>() {
        @Override
        public Optional<Product> findById(String id) {
          return Optional.ofNullable(STORE.get(id));
        }

        @Override
        public String save(Product entity) {
          STORE.put(entity.id(), entity);
          return entity.id();
        }

        @Override
        public List<Product> findAll() {
          return List.copyOf(STORE.values());
        }

        @Override
        public void deleteAllById(List<String> ids) {
          ids.forEach(STORE::remove);
        }
      };
    }
  }

  @UI("")
  @Title("Shell")
  public static class Shell {
    @Menu Products products;
  }

  static TestMateu mateu;
  static McpService mcp;
  static final ObjectMapper OM = new ObjectMapper();
  static final McpService.HttpRequestFactory REQUESTS =
      rq -> new FakeHttpRequest(rq).withAttribute("baseUrl", "");

  @BeforeAll
  static void boot() {
    // own harness: a root app changes route resolution for every other fixture
    mateu = TestMateu.withUis(Shell.class);
    mcp = new McpService(mateu.service(), OM);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  @BeforeEach
  void seed() {
    STORE.clear();
    STORE.put("P-001", new Product("P-001", "Espresso machine"));
  }

  private static List<String> values(JsonNode array, String key) {
    var out = new ArrayList<String>();
    array.forEach(node -> out.add(node.path(key).asText()));
    return out;
  }

  private static List<String> errors(JsonNode screen) {
    var out = new ArrayList<String>();
    screen
        .path("messages")
        .forEach(
            m -> {
              if ("error".equals(m.path("variant").asText())) out.add(m.path("text").asText());
            });
    return out;
  }

  @Test
  void theCreationFormsCreateCreatesTheRecord() {
    var form = mcp.describeScreen("products/new", "", REQUESTS);
    assertThat(values(form.get("actions"), "id")).contains("create");

    var created =
        mcp.runAction(
            "products/new", "create", Map.of("id", "P-100", "name", "Tamper"), "", REQUESTS);

    assertThat(errors(created)).isEmpty();
    assertThat(STORE).containsKey("P-100");
    var found = mcp.search("products", "Tamper", null, "", REQUESTS);
    assertThat(values(found.path("listing").path("rows"), "name")).containsExactly("Tamper");
  }

  @Test
  void theEditorsSaveSavesTheRecordItWasOpenedFor() {
    var editor = mcp.describeScreen("products/P-001/edit", "", REQUESTS);
    assertThat(values(editor.get("actions"), "id")).contains("save");

    var saved =
        mcp.runAction(
            "products/P-001/edit", "save", Map.of("name", "Espresso machine X"), "", REQUESTS);

    assertThat(errors(saved)).isEmpty();
    assertThat(STORE.get("P-001").name()).isEqualTo("Espresso machine X");
  }
}
