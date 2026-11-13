package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.EditableOnlyWhenCreating;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.interfaces.CrudStore;
import io.mateu.uidl.interfaces.Identifiable;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/**
 * A crud entity's TECHNICAL id — its declared id, which the store assigns (no {@code
 * EditableOnlyWhenCreating}, no {@code GeneratedValue}) — has no input on the creation form and is
 * never taken from a create: the Vaadin create drawer invited the user to type one, and an existing
 * id overwrote that record (GA Explorer pass, F6). An {@code @EditableOnlyWhenCreating} id is the
 * user's to type on create, as before.
 */
class CrudTechnicalIdSyncTest {

  private static final ObjectMapper JSON =
      new ObjectMapper()
          .registerModule(new JavaTimeModule())
          .disable(SerializationFeature.FAIL_ON_EMPTY_BEANS);

  public static class Artwork implements Identifiable {
    public String id;
    public String title;

    public Artwork() {}

    Artwork(String id, String title) {
      this.id = id;
      this.title = title;
    }

    @Override
    public String id() {
      return id;
    }
  }

  public static class Sku implements Identifiable {
    @EditableOnlyWhenCreating public String id;
    public String title;

    @Override
    public String id() {
      return id;
    }
  }

  static final List<Artwork> ARTWORKS = new ArrayList<>();
  static final List<Sku> SKUS = new ArrayList<>();

  static <T extends Identifiable> CrudStore<T> storeOf(
      List<T> rows, java.util.function.Consumer<T> assign) {
    return new CrudStore<>() {
      @Override
      public Optional<T> findById(String id) {
        return rows.stream().filter(r -> r.id().equals(id)).findFirst();
      }

      @Override
      public String save(T entity) {
        if (entity.id() == null || entity.id().isBlank()) {
          assign.accept(entity);
        }
        rows.removeIf(r -> r.id().equals(entity.id()));
        rows.add(entity);
        return entity.id();
      }

      @Override
      public List<T> findAll() {
        return rows;
      }

      @Override
      public void deleteAllById(List<String> ids) {}
    };
  }

  @UI("/tid-artworks")
  @Title("Artworks")
  public static class Artworks extends AutoCrud<Artwork> {
    @Override
    public CrudStore<Artwork> store() {
      return storeOf(ARTWORKS, a -> a.id = UUID.randomUUID().toString());
    }
  }

  @UI("/tid-skus")
  @Title("SKUs")
  public static class Skus extends AutoCrud<Sku> {
    @Override
    public CrudStore<Sku> store() {
      return storeOf(SKUS, s -> s.id = "generated");
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(Artworks.class, Skus.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  @BeforeEach
  void seed() {
    ARTWORKS.clear();
    ARTWORKS.add(new Artwork("a1", "Water Lilies"));
    SKUS.clear();
  }

  private static UIIncrementDto run(
      Class<?> crud, String route, String consumed, String action, Map<String, Object> params) {
    return mateu.run(
        RunActionRqDto.builder()
            .route(route)
            .consumedRoute(consumed)
            .serverSideType(crud.getName())
            .actionId(action)
            .initiatorComponentId("c1")
            .componentState(Map.of())
            .parameters(params)
            .build());
  }

  private static List<String> fieldIds(UIIncrementDto increment) {
    var ids = new ArrayList<String>();
    collect(JSON.valueToTree(increment), ids);
    return ids;
  }

  private static void collect(JsonNode node, List<String> out) {
    if (node.isObject() && "FormField".equals(node.path("type").asText())) {
      out.add(node.path("fieldId").asText());
    }
    node.forEach(child -> collect(child, out));
  }

  @Test
  void aTechnicalIdHasNoInputOnTheCreationFormAndIsNeverTakenFromACreate() {
    var form = run(Artworks.class, "/tid-artworks/new", "/tid-artworks", "", Map.of());
    assertThat(fieldIds(form)).contains("title").doesNotContain("id");
    // a create naming an existing id does not overwrite it: the store assigns a new one
    run(
        Artworks.class,
        "/tid-artworks/new",
        "/tid-artworks",
        "create",
        Map.of("initiatorState", Map.of("id", "a1", "title", "Forged")));
    assertThat(ARTWORKS).hasSize(2);
    assertThat(ARTWORKS.stream().filter(a -> a.id.equals("a1")).findFirst().orElseThrow().title)
        .isEqualTo("Water Lilies");
  }

  @Test
  void anIdTheUserChoosesOnCreateKeepsItsInput() {
    var form = run(Skus.class, "/tid-skus/new", "/tid-skus", "", Map.of());
    assertThat(fieldIds(form)).contains("id", "title");
    run(
        Skus.class,
        "/tid-skus/new",
        "/tid-skus",
        "create",
        Map.of("initiatorState", Map.of("id", "SKU-1", "title", "Lamp")));
    assertThat(SKUS).singleElement().satisfies(s -> assertThat(s.id).isEqualTo("SKU-1"));
  }
}
