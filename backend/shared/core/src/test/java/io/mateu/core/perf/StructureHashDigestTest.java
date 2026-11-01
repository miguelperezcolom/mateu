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
 * JSON of the component without its instance ids (its own and its nested components' UUIDs) and
 * hash slot.
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
    var tree = CANONICAL.valueToTree(component.withId(null).withStructureHash(null));
    // the instance ids (UUIDs) of nested components are not structure either
    tree.findParents("id").stream()
        .map(com.fasterxml.jackson.databind.node.ObjectNode.class::cast)
        .filter(o -> o.get("id").asText().matches("[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}"))
        .forEach(o -> o.putNull("id"));
    byte[] json = CANONICAL.writeValueAsBytes(tree);
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

  /**
   * A nested component that names no id gets a fresh UUID on every request: the same structure must
   * still hash the same, or the client never gets the state-only answer and re-mounts (and
   * re-loads) the page it already painted from its cache. An id the structure names still counts.
   */
  @Test
  void nestedInstanceIdsDoNotChangeTheHashButNamedIdsDo() {
    var page = routed(mateu.sync("/hash/form")).get(0);
    String first = hashWith(page, java.util.UUID.randomUUID().toString());
    String second = hashWith(page, java.util.UUID.randomUUID().toString());
    assertThat(first).isEqualTo(second);
    assertThat(hashWith(page, "name")).isNotEqualTo(hashWith(page, "surname"));
  }

  static String hashWith(ServerSideComponentDto page, String childId) {
    var child =
        new io.mateu.dtos.ClientSideComponentDto(
            new io.mateu.dtos.ElementDto("div", java.util.Map.of(), java.util.Map.of(), "About"),
            childId,
            List.of(),
            null,
            null,
            null,
            null);
    var children = new java.util.ArrayList<>(page.children());
    children.add(child);
    var component = (ServerSideComponentDto) page.withChildren(children);
    var increment =
        UIIncrementDto.builder()
            .fragments(List.of(io.mateu.dtos.UIFragmentDto.builder().component(component).build()))
            .build();
    var stamped =
        io.mateu.core.infra.StructureHashPostProcessor.apply(increment, null).fragments().get(0);
    return ((ServerSideComponentDto) stamped.component()).structureHash();
  }
}
