package io.mateu.explorer.examples.archetypes.generaloverview;

import io.mateu.core.infra.declarative.orchestrators.generaloverview.GeneralOverview;
import io.mateu.uidl.data.BulletedList;
import io.mateu.uidl.data.Card;
import io.mateu.uidl.data.Chip;
import io.mateu.uidl.data.EntityHeader;
import io.mateu.uidl.data.Fact;
import io.mateu.uidl.data.Option;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

/**
 * The {@code GeneralOverview} archetype: a record switcher on top (the first record is selected),
 * the selected record's {@link #overview} below and its contextual {@link #info} panel beside it.
 * Switching records re-renders in place.
 */
public class MuseumOverview extends GeneralOverview<MuseumOverview.Museum> {

  public record Museum(
      String id, String name, String city, String status, int works, String visitors, List<String> news) {}

  static final List<Museum> MUSEUMS =
      List.of(
          new Museum("met", "The Met", "New York", "Open", 1820, "26,400", List.of(
              "New wing for arms and armour", "Monet loan returned from SMK")),
          new Museum("smk", "SMK", "Copenhagen", "Open", 640, "9,800", List.of(
              "Water Lilies on loan until January")),
          new Museum("cma", "Cleveland Museum of Art", "Cleveland", "Partly closed", 910, "12,010", List.of(
              "Gallery 6 closed for installation", "Open access images updated")));

  @Override
  protected List<Option> switcherOptions(HttpRequest httpRequest) {
    return MUSEUMS.stream().map(m -> new Option(m.id(), m.name())).toList();
  }

  @Override
  protected Museum load(String id, HttpRequest httpRequest) {
    return MUSEUMS.stream().filter(m -> m.id().equals(id)).findFirst().orElse(null);
  }

  @Override
  protected String recordLabel() {
    return "Museum";
  }

  @Override
  protected Component overview(Museum museum, HttpRequest httpRequest) {
    return VerticalLayout.builder()
        .spacing(true)
        .content(
            List.of(
                EntityHeader.builder()
                    .title(museum.name())
                    .subtitle(museum.city())
                    .badges(List.of(Chip.builder()
                        .label(museum.status())
                        .color("Open".equals(museum.status()) ? "success" : "warning")
                        .build()))
                    .facts(List.of(Fact.builder().label("Works").value(String.valueOf(museum.works())).build()))
                    .metricLabel("Visitors this month")
                    .metricValue(museum.visitors())
                    .build(),
                Card.builder()
                    .title(new Text("About"))
                    .content(new Text(museum.name() + " lends and borrows through the network."))
                    .build()))
        .build();
  }

  /** The complementary side panel of the template; {@code display()} can switch it off. */
  @Override
  protected Component info(Museum museum, HttpRequest httpRequest) {
    return Card.builder()
        .title(new Text("Recent news"))
        .content(new BulletedList("news", museum.news(), null, null))
        .build();
  }
}
