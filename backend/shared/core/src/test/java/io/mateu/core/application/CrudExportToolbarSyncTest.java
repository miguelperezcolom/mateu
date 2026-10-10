package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.ButtonDto;
import io.mateu.dtos.CrudlDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UICommandDto;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.interfaces.CrudStore;
import io.mateu.uidl.interfaces.Identifiable;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * An AutoCrud is a Listing, and ExportActionRunner already exported it — but its toolbar never
 * offered the export buttons, so a csvExportable() crud had no way to export.
 */
class CrudExportToolbarSyncTest {

  public record Guest(String id, String name) implements Identifiable {}

  @UI("/guests-export")
  @Title("Guests")
  public static class GuestsCrud extends AutoCrud<Guest> {
    @Override
    public boolean csvExportable() {
      return true;
    }

    // opted in, but no ListingExporter writes these formats in this backend
    @Override
    public boolean excelExportable() {
      return true;
    }

    @Override
    public boolean pdfExportable() {
      return true;
    }

    @Override
    public CrudStore<Guest> store() {
      return new CrudStore<>() {
        @Override
        public Optional<Guest> findById(String id) {
          return findAll().stream().filter(g -> g.id().equals(id)).findFirst();
        }

        @Override
        public String save(Guest entity) {
          return entity.id();
        }

        @Override
        public List<Guest> findAll() {
          return List.of(new Guest("1", "Ana"), new Guest("2", "Luis"));
        }

        @Override
        public void deleteAllById(List<String> selectedIds) {}
      };
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(GuestsCrud.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private static List<CrudlDto> crudls(io.mateu.dtos.UIIncrementDto increment) {
    var out = new java.util.ArrayList<CrudlDto>();
    for (var f : increment.fragments())
      out.addAll(FieldKindsSyncTest.collect(f.component(), CrudlDto.class));
    return out;
  }

  @Test
  void anExportableAutoCrudOffersTheExportButtonAndExports() {
    // the crud is a mediator: its listing arrives on the content load
    var content =
        mateu.run(
            RunActionRqDto.builder()
                .route("/guests-export")
                .consumedRoute("/guests-export")
                .serverSideType(GuestsCrud.class.getName())
                .actionId("")
                .initiatorComponentId("c1")
                .build());
    var listing = crudls(content);
    if (listing.isEmpty()) listing = crudls(mateu.sync("/guests-export"));
    assertThat(listing).isNotEmpty();
    assertThat(listing.get(0).toolbar()).extracting(ButtonDto::actionId).contains("export-csv");
    // Mateu ships no Excel / PDF engine: without the application's exporter, no button
    assertThat(listing.get(0).toolbar())
        .extracting(ButtonDto::actionId)
        .doesNotContain("export-excel", "export-pdf");
    var exported =
        mateu.run(
            RunActionRqDto.builder()
                .route("/guests-export")
                .consumedRoute("/guests-export")
                .serverSideType(GuestsCrud.class.getName())
                .actionId("export-csv")
                .initiatorComponentId("c1_app")
                .build());
    assertThat(exported.commands())
        .extracting(UICommandDto::type)
        .asString()
        .contains("DownloadFile");
  }

  @Test
  void anExportNobodyWritesIsAMessageNotAnError() {
    var exported =
        mateu.run(
            RunActionRqDto.builder()
                .route("/guests-export")
                .consumedRoute("/guests-export")
                .serverSideType(GuestsCrud.class.getName())
                .actionId("export-excel")
                .initiatorComponentId("c1_app")
                .build());
    assertThat(exported.commands())
        .extracting(UICommandDto::type)
        .asString()
        .doesNotContain("DownloadFile");
    assertThat(exported.messages()).hasSize(1);
    assertThat(exported.messages().get(0).title()).isEqualTo("Export not available");
  }
}
