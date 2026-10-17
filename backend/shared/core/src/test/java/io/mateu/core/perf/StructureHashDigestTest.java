package io.mateu.core.perf;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.MapperFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.ServerSideComponentDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.interfaces.CrudStore;
import java.security.MessageDigest;
import java.util.HexFormat;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * The structure hash is digested while the canonical JSON is written instead of from a byte array
 * of it: the VALUE must not change — it is exactly SHA-256 over the canonical (sorted, ISO-dated)
 * JSON of the component without its instance id and hash slot, as it always was.
 */
class StructureHashDigestTest {

  @UI("/hash/form")
  @Title("Hash form")
  public static class HashForm {
    String name = "Ana";
    int age = 30;
    java.time.LocalDate born = java.time.LocalDate.of(1990, 1, 2);
  }

  @UI("/hash/items")
  @Title("Hash items")
  public static class HashItems extends AutoCrud<RequestBudgetTest.Item> {
    @Override
    public CrudStore<RequestBudgetTest.Item> store() {
      return new CrudStore<>() {
        @Override
        public Optional<RequestBudgetTest.Item> findById(String id) {
          return Optional.empty();
        }

        @Override
        public String save(RequestBudgetTest.Item entity) {
          return null;
        }

        @Override
        public List<RequestBudgetTest.Item> findAll() {
          return List.of();
        }

        @Override
        public void deleteAllById(List<String> selectedIds) {}
      };
    }
  }

  /** The canonical mapper, configured as the post-processor's — written out independently. */
  static final ObjectMapper CANONICAL =
      new ObjectMapper()
          .registerModule(new JavaTimeModule())
          .configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false)
          .configure(SerializationFeature.FAIL_ON_EMPTY_BEANS, false)
          .configure(MapperFeature.SORT_PROPERTIES_ALPHABETICALLY, true)
          .configure(SerializationFeature.ORDER_MAP_ENTRIES_BY_KEYS, true);

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(HashForm.class, HashItems.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  static String expected(ServerSideComponentDto component) throws Exception {
    byte[] json = CANONICAL.writeValueAsBytes(component.withId(null).withStructureHash(null));
    return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(json));
  }

  static List<ServerSideComponentDto> routed(UIIncrementDto increment) {
    return increment.fragments().stream()
        .filter(f -> f.component() instanceof ServerSideComponentDto)
        .map(f -> (ServerSideComponentDto) f.component())
        .toList();
  }

  @Test
  void theHashIsSha256OverTheCanonicalJsonAsBefore() throws Exception {
    for (var route : List.of("/hash/form", "/hash/items")) {
      var components = routed(mateu.sync(route));
      assertThat(components).as(route).isNotEmpty();
      for (var component : components) {
        assertThat(component.structureHash()).as(route).isEqualTo(expected(component));
      }
    }
  }
}
