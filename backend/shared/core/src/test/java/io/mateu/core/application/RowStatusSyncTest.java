package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.CrudlDto;
import io.mateu.uidl.annotations.RowStatus;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.SearchRequest;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Listing;
import java.util.List;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * Row tones: the row field annotated @RowStatus travels as CrudlDto.rowStatusField, so a renderer
 * can colour the whole row by its value (a reservation due out, a room out of order).
 */
class RowStatusSyncTest {

  public enum Tone {
    success,
    warning,
    danger
  }

  public record ReservationRow(String id, String guest, @RowStatus Tone tone) {}

  public record PlainRow(String id, String name) {}

  @SuppressWarnings("unused")
  @UI("/toned")
  @Title("Toned")
  public static class Toned implements Listing<ReservationRow> {
    @Override
    public ListingData<ReservationRow> search(SearchRequest request, HttpRequest httpRequest) {
      return ListingData.from(List.of(new ReservationRow("r1", "Ana", Tone.warning)));
    }
  }

  @SuppressWarnings("unused")
  @UI("/plain-listing")
  @Title("Plain")
  public static class Plain implements Listing<PlainRow> {
    @Override
    public ListingData<PlainRow> search(SearchRequest request, HttpRequest httpRequest) {
      return ListingData.from(List.of(new PlainRow("p1", "x")));
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(Toned.class, Plain.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private static CrudlDto crudl(String route) {
    return FieldKindsSyncTest.collect(
            mateu.sync(route).fragments().get(0).component(), CrudlDto.class)
        .get(0);
  }

  @Test
  void theRowStatusFieldTravelsOnTheListing() {
    assertThat(crudl("/toned").rowStatusField()).isEqualTo("tone");
  }

  @Test
  void aRowWithoutRowStatusHasNone() {
    assertThat(crudl("/plain-listing").rowStatusField()).isNull();
  }
}
