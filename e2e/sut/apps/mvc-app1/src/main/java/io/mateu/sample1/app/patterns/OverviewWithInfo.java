package io.mateu.sample1.app.patterns;

import io.mateu.core.infra.declarative.orchestrators.generaloverview.GeneralOverview;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.BulletedList;
import io.mateu.uidl.data.Card;
import io.mateu.uidl.data.EntityHeader;
import io.mateu.uidl.data.Fact;
import io.mateu.uidl.data.Option;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

/** Pattern gaps showcase: GeneralOverview's contextual info slot beside the overview. */
@UI("/patterns/overview")
@Title("Requisitions")
public class OverviewWithInfo extends GeneralOverview<OverviewWithInfo.Requisition> {

  public record Requisition(String id, String title, String unit, String status) {}

  static final List<Requisition> ROWS =
      List.of(
          new Requisition("r1", "Requisition 204", "Vision Operations", "Processing"),
          new Requisition("r2", "Requisition 205", "Vision Services", "Approved"));

  @Override
  protected List<Option> switcherOptions(HttpRequest httpRequest) {
    return ROWS.stream().map(r -> new Option(r.id(), r.title())).toList();
  }

  @Override
  protected Requisition load(String id, HttpRequest httpRequest) {
    return ROWS.stream().filter(r -> r.id().equals(id)).findFirst().orElse(null);
  }

  @Override
  protected Component overview(Requisition row, HttpRequest httpRequest) {
    return EntityHeader.builder()
        .title(row.title())
        .facts(
            List.of(
                Fact.builder().label("Business unit").value(row.unit()).build(),
                Fact.builder().label("Status").value(row.status()).build()))
        .build();
  }

  @Override
  protected Component info(Requisition row, HttpRequest httpRequest) {
    return Card.builder()
        .content(
            VerticalLayout.builder()
                .content(
                    List.of(
                        new Text("info-title", "Recent activity"),
                        new BulletedList(
                            "info-activity",
                            List.of(
                                "Approved by J. Smith — 2 days ago",
                                "Supplier quote attached — 3 days ago",
                                "Created — 1 week ago"),
                            null,
                            null)))
                .build())
        .build();
  }
}
