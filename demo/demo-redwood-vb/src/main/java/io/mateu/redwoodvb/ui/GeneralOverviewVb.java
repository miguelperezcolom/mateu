package io.mateu.redwoodvb.ui;

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
 * GeneralOverview archetype rendered by the Mateu-on-Visual-Builder renderer: a record context
 * switcher on top and the selected record's overview below (EntityHeader over property cards).
 */
@UI("/general-overview-vb")
@Title("Reservas")
public class GeneralOverviewVb extends GeneralOverview<GeneralOverviewVb.Reserva> {

  public record Reserva(
      String id,
      String title,
      String hotel,
      String huesped,
      String estado,
      double importe,
      List<String> lineas) {}

  private static final List<Reserva> RESERVAS =
      List.of(
          new Reserva(
              "r1",
              "Reserva 204",
              "Gran Hotel Central",
              "Ana Ruiz",
              "Confirmada",
              1248.50,
              List.of("Habitación doble (3 noches)", "Desayuno buffet", "Parking")),
          new Reserva(
              "r2",
              "Reserva 205",
              "Hotel Marina",
              "Luis Prat",
              "Pendiente",
              315.00,
              List.of("Suite (1 noche)")),
          new Reserva(
              "r3",
              "Reserva 206",
              "Aparthotel Sol",
              "Marta Gil",
              "Cancelada",
              489.75,
              List.of("Apartamento (2 noches)", "Late check-out")));

  @Override
  protected List<Option> switcherOptions(HttpRequest httpRequest) {
    return RESERVAS.stream()
        .map(r -> new Option(r.id(), r.title(), null, null, null, null, null))
        .toList();
  }

  @Override
  protected Reserva load(String id, HttpRequest httpRequest) {
    return RESERVAS.stream().filter(r -> r.id().equals(id)).findFirst().orElse(null);
  }

  @Override
  protected Component overview(Reserva r, HttpRequest httpRequest) {
    var color =
        switch (r.estado()) {
          case "Confirmada" -> "success";
          case "Pendiente" -> "warning";
          default -> "contrast";
        };
    var header =
        EntityHeader.builder()
            .title(r.title())
            .subtitle("Reserva de alojamiento")
            .badges(List.of(Chip.builder().label(r.estado()).color(color).build()))
            .facts(
                List.of(
                    Fact.builder().label("Hotel").value(r.hotel()).build(),
                    Fact.builder().label("Huésped").value(r.huesped()).build(),
                    Fact.builder().label("Líneas").value(String.valueOf(r.lineas().size())).build()))
            .metricLabel("Importe")
            .metricValue("%,.2f €".formatted(r.importe()))
            .build();
    var lineas =
        Card.builder()
            .title(Text.builder().text("Líneas").build())
            .content(
                StatusList.builder()
                    .items(
                        r.lineas().stream()
                            .map(l -> StatusItem.builder().title(l).status("OK").statusColor("success").build())
                            .toList())
                    .frameless(true)
                    .build())
            .style("flex: 1; min-width: 20rem;")
            .build();
    var datos =
        Card.builder()
            .title(Text.builder().text("Datos").build())
            .content(
                VerticalLayout.builder()
                    .spacing(true)
                    .content(
                        List.of(
                            Text.builder().text("Huésped: " + r.huesped()).build(),
                            Text.builder().text("Hotel: " + r.hotel()).build(),
                            Text.builder().text("Estado: " + r.estado()).build()))
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
                    .content(List.of(lineas, datos))
                    .build()))
        .build();
  }
}
