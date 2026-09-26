package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.CrudlDto;
import io.mateu.dtos.GridColumnDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.uidl.annotations.Details;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.SearchRequest;
import io.mateu.uidl.interfaces.CrudStore;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Identifiable;
import io.mateu.uidl.interfaces.Listing;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * The row detail: a field of the row marked {@code @Details} is not a column — it travels as the
 * listing's detailPath and opens under the row on a click. The row keeps carrying the value (the
 * frontend reads {@code row[detailPath]}); only the column is gone.
 */
class RowDetailsSyncTest {

  @SuppressWarnings("unused")
  @UI("/audit-like")
  @Title("Audited actions")
  public static class AuditLike implements Listing<AuditLike.Row> {

    public record Row(String when, String action, @Details String parameters) {}

    @Override
    public ListingData<Row> search(SearchRequest request, HttpRequest httpRequest) {
      return ListingData.of(new Row("today", "approve", "{\"code\":\"NOS\"}"));
    }
  }

  @SuppressWarnings("unused")
  @UI("/plain-list")
  @Title("Plain")
  public static class PlainList implements Listing<PlainList.Row> {

    public record Row(String when, String action) {}

    @Override
    public ListingData<Row> search(SearchRequest request, HttpRequest httpRequest) {
      return ListingData.of();
    }
  }

  public static class Note implements Identifiable {
    String id;
    String title;
    @Details String body;

    public Note() {}

    @Override
    public String id() {
      return id;
    }
  }

  @UI("/notes")
  @Title("Notes")
  public static class NotesCrud extends AutoCrud<Note> {
    @Override
    public CrudStore<Note> store() {
      var notes = new ArrayList<Note>();
      return new CrudStore<>() {
        @Override
        public Optional<Note> findById(String id) {
          return notes.stream().filter(n -> n.id.equals(id)).findFirst();
        }

        @Override
        public String save(Note entity) {
          notes.add(entity);
          return entity.id;
        }

        @Override
        public List<Note> findAll() {
          return notes;
        }

        @Override
        public void deleteAllById(List<String> selectedIds) {
          notes.removeIf(n -> selectedIds.contains(n.id));
        }
      };
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(AuditLike.class, PlainList.class, NotesCrud.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private static CrudlDto crudl(String route) {
    var crudls = new ArrayList<CrudlDto>();
    FieldKindsSyncTest.walk(
        mateu.sync(route).fragments().get(0).component(), CrudlDto.class, crudls);
    assertThat(crudls).isNotEmpty();
    return crudls.get(0);
  }

  private static List<String> columnIds(CrudlDto crudl) {
    var ids = new ArrayList<String>();
    for (var col : crudl.columns()) {
      if (col instanceof ClientSideComponentDto c && c.metadata() instanceof GridColumnDto gc) {
        ids.add(gc.id());
      }
    }
    return ids;
  }

  @Test
  void aDetailsFieldOfTheRowIsTheListingsRowDetailAndNotAColumn() {
    var crudl = crudl("/audit-like");

    assertThat(crudl.detailPath()).isEqualTo("parameters");
    // a click on the row opens it: no expand button column
    assertThat(crudl.useButtonForDetail()).isFalse();
    assertThat(columnIds(crudl)).contains("when", "action").doesNotContain("parameters");
  }

  @Test
  void aRowWithoutDetailsHasNoRowDetail() {
    var crudl = crudl("/plain-list");

    assertThat(crudl.detailPath()).isNull();
    assertThat(columnIds(crudl)).contains("when", "action");
  }

  @Test
  void anAutoCrudCarriesTheRowDetailToo() {
    var crudls = new ArrayList<CrudlDto>();
    FieldKindsSyncTest.walk(
        mateu
            .run(
                RunActionRqDto.builder()
                    .route("/notes")
                    .consumedRoute("/notes")
                    .serverSideType(NotesCrud.class.getName())
                    .actionId("")
                    .initiatorComponentId("c1_app")
                    .componentState(Map.of())
                    .build())
            .fragments()
            .get(0)
            .component(),
        CrudlDto.class,
        crudls);
    assertThat(crudls).isNotEmpty();
    var crudl = crudls.get(0);

    assertThat(crudl.detailPath()).isEqualTo("body");
    assertThat(columnIds(crudl)).contains("title").doesNotContain("body");
  }
}
