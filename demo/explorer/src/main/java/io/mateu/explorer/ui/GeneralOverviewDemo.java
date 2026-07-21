package io.mateu.explorer.ui;

import io.mateu.core.infra.declarative.orchestrators.generaloverview.GeneralOverview;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Card;
import io.mateu.uidl.data.Chip;
import io.mateu.uidl.data.EntityHeader;
import io.mateu.uidl.data.Fact;
import io.mateu.uidl.data.HorizontalLayout;
import io.mateu.uidl.data.Option;
import io.mateu.uidl.data.StatusItem;
import io.mateu.uidl.data.StatusList;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

/**
 * General Overview screen for the Explorer (the Redwood "General Overview" template): a record
 * context switcher on top, and the selected record's overview below — an EntityHeader strip over
 * side-by-side property cards. Rendered by the redwood-spectra renderer.
 */
@UI("/general-overview")
@Title("Requisitions")
public class GeneralOverviewDemo extends GeneralOverview<GeneralOverviewDemo.Requisition> {

  public record Requisition(
      String id,
      String title,
      String unit,
      String preparer,
      String status,
      double amount,
      List<String> lines) {}

  private static final List<Requisition> REQUISITIONS =
      List.of(
          new Requisition(
              "r1",
              "Requisition 204",
              "Vision Operations",
              "100.100.004.256.766",
              "Processing",
              12480.50,
              List.of("Portátiles (x12)", "Monitores 27\" (x12)", "Docking stations (x12)")),
          new Requisition(
              "r2",
              "Requisition 205",
              "Vision Services",
              "100.100.004.311.020",
              "Approved",
              3150.00,
              List.of("Licencias IDE (x25)")),
          new Requisition(
              "r3",
              "Requisition 206",
              "Vision Manufacturing",
              "100.100.004.107.554",
              "Draft",
              48900.75,
              List.of("Célula robótica", "Mantenimiento anual", "Formación operarios")));

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
    var statusColor =
        switch (req.status()) {
          case "Approved" -> "success";
          case "Processing" -> "warning";
          default -> "contrast";
        };
    var header =
        EntityHeader.builder()
            .title(req.title())
            .badges(List.of(Chip.builder().label(req.status()).color(statusColor).build()))
            .subtitle("Purchase requisition")
            .facts(
                List.of(
                    Fact.builder().label("Business Unit").value(req.unit()).build(),
                    Fact.builder().label("Preparer ID").value(req.preparer()).build(),
                    Fact.builder().label("Lines").value(String.valueOf(req.lines().size())).build()))
            .metricLabel("Amount")
            .metricValue("%,.2f €".formatted(req.amount()))
            .build();
    var lines =
        Card.builder()
            .title(Text.builder().text("Lines").build())
            .content(
                StatusList.builder()
                    .items(
                        req.lines().stream()
                            .map(
                                line ->
                                    StatusItem.builder()
                                        .title(line)
                                        .status("OK")
                                        .statusColor("success")
                                        .build())
                            .toList())
                    .frameless(true)
                    .build())
            .style("flex: 1; min-width: 20rem;")
            .build();
    var approval =
        Card.builder()
            .title(Text.builder().text("Approval").build())
            .content(
                VerticalLayout.builder()
                    .spacing(true)
                    .content(
                        List.of(
                            Text.builder().text("Requested by: " + req.preparer()).build(),
                            Text.builder().text("Status: " + req.status()).build()))
                    .build())
            .style("flex: 1; min-width: 16rem;")
            .build();
    return VerticalLayout.builder()
        .spacing(true)
        .fullWidth(true)
        .content(
            List.of(
                header,
                HorizontalLayout.builder()
                    .spacing(true)
                    .fullWidth(true)
                    .style("align-items: flex-start; gap: 1.5rem; flex-wrap: wrap;")
                    .content(List.of(lines, approval))
                    .build()))
        .build();
  }
}
