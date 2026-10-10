package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.infra.JsonSerializer;
import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.core.testutil.TestMateu;
import io.mateu.core.testutil.WireWalk;
import io.mateu.dtos.GridColumnDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.NotNavigable;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.interfaces.CrudStore;
import io.mateu.uidl.interfaces.Identifiable;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * Two gaps of a listing: (1) an enum column showed the raw constant ({@code IN_HOUSE}) while every
 * form option already read "In house" — the column now carries the labels as {@code valueLabels},
 * while the rows keep the raw value; (2) a {@code @NotNavigable} crud offered no row link but still
 * served the record page to a typed URL.
 */
class CrudCellsAndRecordPagesSyncTest {

  public enum StayStatus {
    IN_HOUSE,
    @Label("Checked out")
    DEPARTED,
    DUE_OUT;

    // no toString override: the humanized name
  }

  public static class Stay implements Identifiable {
    String id;
    String guest;
    StayStatus status;

    public Stay() {}

    public Stay(String id, String guest, StayStatus status) {
      this.id = id;
      this.guest = guest;
      this.status = status;
    }

    @Override
    public String id() {
      return id;
    }
  }

  static final List<Stay> STAYS =
      List.of(
          new Stay("1", "Ada Lovelace", StayStatus.IN_HOUSE),
          new Stay("2", "Alan Turing", StayStatus.DEPARTED));

  static CrudStore<Stay> store() {
    return new CrudStore<>() {
      @Override
      public Optional<Stay> findById(String id) {
        return STAYS.stream().filter(s -> s.id().equals(id)).findFirst();
      }

      @Override
      public String save(Stay entity) {
        return entity.id();
      }

      @Override
      public List<Stay> findAll() {
        return STAYS;
      }

      @Override
      public void deleteAllById(List<String> selectedIds) {}
    };
  }

  @UI("/stays")
  @Title("Stays")
  public static class StaysCrud extends AutoCrud<Stay> {
    @Override
    public CrudStore<Stay> store() {
      return CrudCellsAndRecordPagesSyncTest.store();
    }
  }

  @UI("/board")
  @Title("Board")
  @NotNavigable
  public static class BoardCrud extends AutoCrud<Stay> {
    @Override
    public CrudStore<Stay> store() {
      return CrudCellsAndRecordPagesSyncTest.store();
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(StaysCrud.class, BoardCrud.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private static UIIncrementDto run(String route, String consumed, Class<?> crud, String action) {
    return mateu.run(
        RunActionRqDto.builder()
            .route(route)
            .consumedRoute(consumed)
            .serverSideType(crud.getName())
            .actionId(action)
            .initiatorComponentId("c1_app")
            .componentState(Map.of())
            .build());
  }

  // ── (1) enum cells ─────────────────────────────────────────────────────────

  @Test
  void anEnumColumnCarriesTheLabelsItsOptionsUse() {
    var increment = run("/stays", "/stays", StaysCrud.class, "");
    var status =
        WireWalk.all(increment, GridColumnDto.class).stream()
            .filter(column -> "status".equals(column.id()))
            .findFirst()
            .orElseThrow();
    assertThat(status.valueLabels())
        .containsEntry("IN_HOUSE", "In house")
        .containsEntry("DEPARTED", "Checked out")
        .containsEntry("DUE_OUT", "Due out");
    var guest =
        WireWalk.all(increment, GridColumnDto.class).stream()
            .filter(column -> "guest".equals(column.id()))
            .findFirst()
            .orElseThrow();
    assertThat(guest.valueLabels()).isNull();
  }

  @Test
  @SuppressWarnings("unchecked")
  void theRowsKeepTheRawValueForSortingFilteringAndEditing() {
    var increment = run("/stays", "/stays", StaysCrud.class, "search");
    var data = (Map<String, Object>) increment.fragments().get(0).data();
    var rows = JsonSerializer.toJson(((ListingData<?>) data.get("crud")).page().content());
    assertThat(rows).contains("IN_HOUSE").doesNotContain("In house");
  }

  // ── (2) @NotNavigable record pages ─────────────────────────────────────────

  @Test
  void aNavigableCrudServesItsRecordPage() {
    var wire = JsonSerializer.toJson(run("/stays/1", "/stays", StaysCrud.class, ""));
    assertThat(wire).contains("Ada Lovelace");
  }

  @Test
  void aNotNavigableCrudDoesNotServeARecordPageByUrl() {
    var wire = JsonSerializer.toJson(run("/board/1", "/board", BoardCrud.class, ""));
    assertThat(wire).doesNotContain("Ada Lovelace");
    assertThat(wire).contains("NotFound");
  }

  @Test
  void aNotNavigableCrudStillServesItsListing() {
    var wire = JsonSerializer.toJson(run("/board", "/board", BoardCrud.class, ""));
    assertThat(wire).contains("Board");
  }
}
