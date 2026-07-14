package io.mateu.mdd.demofrontoffice.ui.encasa;

import io.mateu.mdd.demofrontoffice.data.HotelData;
import io.mateu.mdd.demofrontoffice.ui.common.GuestHeaders;
import io.mateu.uidl.annotations.Audience;
import io.mateu.uidl.annotations.Hidden;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.FormLayout;
import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.annotations.Section;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.Toolbar;
import io.mateu.uidl.data.HorizontalLayout;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.Meter;
import io.mateu.uidl.data.Stat;
import io.mateu.uidl.data.StatusItem;
import io.mateu.uidl.data.StatusList;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.PostHydrationHandler;
import java.util.List;
import java.util.concurrent.Callable;
import lombok.Getter;
import lombok.Setter;

/**
 * Guest 360 of one in-house guest (route {@code /encasa/:id}): the guest banner, the stay account
 * meters, incidents (staff-only), companions and the company history, plus the staff quick actions
 * on the toolbar.
 */
@Getter
@Setter
@Route(value = "/encasa/:id", parentRoute = "")
@Title("En Casa")
@FormLayout(columns = 1)
public class EnCasaDetail implements PostHydrationHandler {

  @Hidden String guestId;

  @Label("")
  @com.fasterxml.jackson.annotation.JsonIgnore
  Callable<Component> header = () -> GuestHeaders.inHouseHeader(guestId);

  @Section("Cuenta de la estancia")
  @Label("")
  @com.fasterxml.jackson.annotation.JsonIgnore
  Callable<Component> cuenta =
      () -> {
        var g = HotelData.inHouse(guestId);
        var consumido = Math.round(g.balance() / g.preauthorized() * 100);
        return HorizontalLayout.builder()
            .spacing(true)
            .fullWidth(true)
            .flexGrows(List.of(1, 1))
            .content(
                List.of(
                    Meter.builder()
                        .label("BALANCE ACTUAL")
                        .value(g.balance())
                        .max(g.preauthorized())
                        .unit("€")
                        .caption(consumido + "% de la preautorización consumido")
                        .warnAt(g.preauthorized() * 0.8)
                        .dangerAt(g.preauthorized() * 0.95)
                        .style("flex: 1;")
                        .build(),
                    Meter.builder()
                        .label("PREAUTORIZACIÓN")
                        .value(g.preauthorized())
                        .max(g.preauthorized())
                        .unit("€")
                        .caption(
                            "Margen disponible: "
                                + GuestHeaders.euros(g.preauthorized() - g.balance()))
                        .style("flex: 1;")
                        .build()))
            .build();
      };

  @Section("Incidencias y quejas en estancia")
  @Audience("Staff")
  @Label("")
  @com.fasterxml.jackson.annotation.JsonIgnore
  Callable<Component> incidencias =
      () -> {
        var g = HotelData.inHouse(guestId);
        if (g.incidents().isEmpty()) {
          return StatusList.builder().style("width: 100%;")
              .items(
                  List.of(
                      StatusItem.builder()
                          .id("none")
                          .icon("✓")
                          .title("Sin incidencias abiertas")
                          .description("Ninguna queja registrada durante esta estancia")
                          .status("OK")
                          .statusColor("success")
                          .build()))
              .build();
        }
        return StatusList.builder().style("width: 100%;")
            .items(
                g.incidents().stream()
                    .map(
                        i ->
                            StatusItem.builder()
                                .id(i.id())
                                .icon(i.icon())
                                .title(i.title())
                                .description(i.description())
                                .status(i.status())
                                .statusColor(i.statusColor())
                                .build())
                    .toList())
            .build();
      };

  @Section("Acompañantes")
  @Label("")
  @com.fasterxml.jackson.annotation.JsonIgnore
  Callable<Component> acompanantes =
      () -> {
        var g = HotelData.inHouse(guestId);
        if (g.companions().isEmpty()) {
          return StatusList.builder().style("width: 100%;")
              .items(
                  List.of(
                      StatusItem.builder()
                          .id("solo")
                          .icon("👤")
                          .title("Sin acompañantes")
                          .description("Huésped único en la habitación")
                          .build()))
              .build();
        }
        return StatusList.builder().style("width: 100%;")
            .items(
                g.companions().stream()
                    .map(
                        c ->
                            StatusItem.builder()
                                .id(c.id())
                                .icon("👤")
                                .title(c.name())
                                .description(c.description())
                                .build())
                    .toList())
            .build();
      };

  @Section("Histórico en la compañía")
  @Audience("Staff")
  @Label("")
  @com.fasterxml.jackson.annotation.JsonIgnore
  Callable<Component> historico =
      () -> {
        var g = HotelData.inHouse(guestId);
        return HorizontalLayout.builder()
            .spacing(true)
            .fullWidth(true)
            .flexGrows(List.of(1, 1, 1, 1, 1))
            .content(
                List.of(
                    stat("estancias", "ESTANCIAS", g.stays()),
                    stat("noches", "NOCHES", g.nights()),
                    stat("anos", "AÑOS CLIENTE", g.years()),
                    stat("quejas", "QUEJAS HISTÓRICAS", g.complaints()),
                    stat("hoteles", "HOTELES VISITADOS", g.hotels())))
            .build();
      };

  static Component stat(String id, String label, int value) {
    return Stat.builder().id(id).label(label).value(String.valueOf(value)).build();
  }

  // ── Staff quick actions ─────────────────────────────────────────────────────

  @Audience("Staff")
  @Toolbar
  @Label("Añadir cargo")
  Object anadirCargo() {
    return new Message("Aquí se añadiría un cargo al folio de la habitación (demo)");
  }

  @Audience("Staff")
  @Toolbar
  @Label("Cambiar habitación")
  Object cambiarHabitacion() {
    return new Message("Aquí se abriría el cambio de habitación (demo)");
  }

  @Audience("Staff")
  @Toolbar
  @Label("Gestionar folio")
  Object gestionarFolio() {
    return new Message("Aquí se abriría la gestión del folio (demo)");
  }

  @Audience("Staff")
  @Toolbar
  @Label("Mensaje huésped")
  Object mensajeHuesped() {
    return new Message("Aquí se enviaría un mensaje al huésped (demo)");
  }

  @Audience("Staff")
  @Toolbar
  @Label("Registrar petición")
  Object registrarPeticion() {
    return new Message("Aquí se registraría una nueva petición del huésped (demo)");
  }

  @Override
  public void onHydrated(HttpRequest httpRequest) {
    if (guestId == null || guestId.isBlank()) {
      guestId = GuestHeaders.idFromRoute(httpRequest, "encasa");
    }
  }
}
