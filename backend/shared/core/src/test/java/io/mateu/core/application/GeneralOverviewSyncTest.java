package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.infra.declarative.orchestrators.generaloverview.GeneralOverview;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.EntityHeaderDto;
import io.mateu.dtos.FormFieldDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Chip;
import io.mateu.uidl.data.EntityHeader;
import io.mateu.uidl.data.Fact;
import io.mateu.uidl.data.Option;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * GeneralOverview archetype (the Redwood "General Overview" template): a record context switcher
 * over the selected record's overview (EntityHeader + detail), re-rendered in place.
 */
class GeneralOverviewSyncTest {

  record Requisition(String id, String title, String unit, String status) {}

  static final List<Requisition> REQUISITIONS =
      List.of(
          new Requisition("r1", "Requisition 204", "Vision Operations", "Processing"),
          new Requisition("r2", "Requisition 205", "Vision Services", "Approved"));

  @UI("/requisition-overview")
  @Title("Requisitions")
  public static class RequisitionOverview extends GeneralOverview<Requisition> {

    @Override
    protected List<Option> switcherOptions(HttpRequest httpRequest) {
      return REQUISITIONS.stream()
          .map(req -> new Option(req.id(), req.title(), null, null, null, null, null))
          .toList();
    }

    @Override
    protected Requisition load(String id, HttpRequest httpRequest) {
      return REQUISITIONS.stream().filter(req -> req.id().equals(id)).findFirst().orElse(null);
    }

    @Override
    protected Component overview(Requisition req, HttpRequest httpRequest) {
      return EntityHeader.builder()
          .title(req.title())
          .badges(List.of(Chip.builder().label(req.status()).color("success").build()))
          .facts(
              List.of(
                  Fact.builder().label("Business Unit").value(req.unit()).build(),
                  Fact.builder().label("Status").value(req.status()).build()))
          .build();
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(RequisitionOverview.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  @Test
  void initialRenderSelectsTheFirstRecordAndShowsItsHeader() {
    var increment = mateu.sync("/requisition-overview");
    var root = increment.fragments().get(0).component();
    // the switcher renders as a select field with one option per record
    var fields = FieldKindsSyncTest.collect(root, FormFieldDto.class);
    var switcher =
        fields.stream().filter(field -> "record".equals(field.fieldId())).findFirst().orElseThrow();
    assertThat(switcher.options())
        .extracting(option -> option.label())
        .containsExactly("Requisition 204", "Requisition 205");
    // the first record's overview is shown
    var headers = FieldKindsSyncTest.collect(root, EntityHeaderDto.class);
    assertThat(headers).hasSize(1);
    assertThat(headers.get(0).title()).isEqualTo("Requisition 204");
    assertThat(headers.get(0).facts())
        .extracting(fact -> fact.value())
        .contains("Vision Operations");
  }

  @Test
  void switchingTheRecordReRendersTheOverviewInPlace() {
    var increment =
        mateu.run(
            RunActionRqDto.builder()
                .route("/requisition-overview")
                .consumedRoute("/requisition-overview")
                .serverSideType(RequisitionOverview.class.getName())
                .actionId("switchRecord")
                .initiatorComponentId("c1_app")
                .componentState(Map.of("record", "r2"))
                .build());
    var root = increment.fragments().get(0).component();
    var headers = FieldKindsSyncTest.collect(root, EntityHeaderDto.class);
    assertThat(headers).hasSize(1);
    assertThat(headers.get(0).title()).isEqualTo("Requisition 205");
  }
}
