package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.infra.JsonSerializer;
import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.core.testutil.TestMateu;
import io.mateu.core.testutil.WireWalk;
import io.mateu.dtos.CrudlDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.Compact;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.interfaces.CrudStore;
import io.mateu.uidl.interfaces.Identifiable;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * {@code @Compact} on a crud: its listing asks for dense rows ({@code CrudlDto.compact}) and its
 * pages carry the high-density preset with the {@code --mateu-compact:1} marker — what Vaadin (the
 * grid's compact theme, the Lumo overrides) and Redwood (oj-table display="grid", the density
 * class) key on. It used to reach neither.
 */
class CompactCrudSyncTest {

  public static class Row implements Identifiable {
    String id;
    String name;

    public Row() {}

    public Row(String id, String name) {
      this.id = id;
      this.name = name;
    }

    @Override
    public String id() {
      return id;
    }
  }

  static CrudStore<Row> store() {
    return new CrudStore<>() {
      @Override
      public Optional<Row> findById(String id) {
        return Optional.of(new Row(id, "Room " + id));
      }

      @Override
      public String save(Row entity) {
        return entity.id();
      }

      @Override
      public List<Row> findAll() {
        return List.of(new Row("1", "Room 1"));
      }

      @Override
      public void deleteAllById(List<String> selectedIds) {}
    };
  }

  @UI("/dense-rooms")
  @Title("Dense rooms")
  @Compact
  public static class DenseRooms extends AutoCrud<Row> {
    @Override
    public CrudStore<Row> store() {
      return CompactCrudSyncTest.store();
    }
  }

  @UI("/airy-rooms")
  @Title("Airy rooms")
  public static class AiryRooms extends AutoCrud<Row> {
    @Override
    public CrudStore<Row> store() {
      return CompactCrudSyncTest.store();
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(DenseRooms.class, AiryRooms.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private static UIIncrementDto load(String route, String consumed, Class<?> crud) {
    return mateu.run(
        RunActionRqDto.builder()
            .route(route)
            .consumedRoute(consumed)
            .serverSideType(crud.getName())
            .actionId("")
            .initiatorComponentId("c1_app")
            .componentState(Map.of())
            .build());
  }

  @Test
  void aCompactCrudsListingAsksForDenseRowsAndCarriesTheMarker() {
    var increment = load("/dense-rooms", "/dense-rooms", DenseRooms.class);
    assertThat(WireWalk.first(increment, CrudlDto.class).compact()).isTrue();
    assertThat(JsonSerializer.toJson(increment)).contains("--mateu-compact:1");
  }

  @Test
  void itsRecordPageIsCompactToo() {
    assertThat(JsonSerializer.toJson(load("/dense-rooms/1", "/dense-rooms", DenseRooms.class)))
        .contains("--mateu-compact:1");
  }

  @Test
  void aCrudWithoutCompactStaysAiry() {
    var increment = load("/airy-rooms", "/airy-rooms", AiryRooms.class);
    assertThat(WireWalk.first(increment, CrudlDto.class).compact()).isFalse();
    assertThat(JsonSerializer.toJson(increment)).doesNotContain("--mateu-compact:1");
  }
}
