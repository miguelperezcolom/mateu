package io.mateu.mdd.demovb.infra.in.ui;

import io.mateu.core.infra.declarative.orchestrators.generaloverview.GeneralOverview;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Card;
import io.mateu.uidl.data.Chip;
import io.mateu.uidl.data.EntityHeader;
import io.mateu.uidl.data.Fact;
import io.mateu.uidl.data.HorizontalLayout;
import io.mateu.uidl.data.Option;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

/** Arquetipo General Overview: switcher de registro arriba + overview del seleccionado. */
@UI("/requisitions")
@Title("Requisitions")
public class RequisitionsOverview extends GeneralOverview<RequisitionsOverview.Requisition> {

  public record Requisition(
      String id, String title, String unit, String preparer, String status, double amount) {}

  private static final List<Requisition> REQUISITIONS =
      List.of(
          new Requisition(
              "r1", "Requisition 204", "Vision Operations", "E. Ashton", "Processing", 12480.50),
          new Requisition(
              "r2", "Requisition 205", "Vision Services", "L. Smith", "Approved", 3150.00),
          new Requisition(
              "r3", "Requisition 206", "Vision Manufacturing", "P. Chen", "Draft", 48900.75));

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
            .subtitle("Purchase requisition")
            .badges(List.of(Chip.builder().label(req.status()).color(statusColor).build()))
            .facts(
                List.of(
                    Fact.builder().label("Business Unit").value(req.unit()).build(),
                    Fact.builder().label("Preparer").value(req.preparer()).build()))
            .metricLabel("Amount")
            .metricValue("%,.2f €".formatted(req.amount()))
            .build();
    var details =
        Card.builder()
            .title(Text.builder().text("Details").build())
            .content(
                VerticalLayout.builder()
                    .content(
                        List.of(
                            new Text("d1", "Unit: " + req.unit()),
                            new Text("d2", "Preparer: " + req.preparer()),
                            new Text("d3", "Status: " + req.status())))
                    .build())
            .build();
    var approval =
        Card.builder()
            .title(Text.builder().text("Approval").build())
            .content(
                VerticalLayout.builder()
                    .content(
                        List.of(
                            new Text("a1", "Next approver: Finance desk"),
                            new Text("a2", "SLA: 2 business days")))
                    .build())
            .build();
    return VerticalLayout.builder()
        .content(List.of(header, HorizontalLayout.builder().content(List.of(details, approval)).build()))
        .build();
  }
}
