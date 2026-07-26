package io.mateu.mdd.demofrontoffice.ui.encasa;

import io.mateu.mdd.demofrontoffice.domain.stay.Incident;
import io.mateu.mdd.demofrontoffice.ui.common.FrontOffice;
import io.mateu.mdd.demofrontoffice.ui.common.GuestHeaders;
import io.mateu.uidl.annotations.Audience;
import io.mateu.uidl.annotations.FormLayout;
import io.mateu.uidl.annotations.Hidden;
import io.mateu.uidl.annotations.Label;
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
 * Guest 360 of one in-house stay (route {@code /encasa/:id}): the guest banner, the stay account
 * meters, incidents (staff-only), companions and the company history, plus the staff quick actions
 * on the toolbar.
 */
@Getter
@Setter
@Route(value = "/encasa/:id", parentRoute = "")
@Title("En Casa")
@FormLayout(columns = 1)
public class EnCasaDetail implements PostHydrationHandler {

  @Hidden String stayId;

  @Label("")
  Callable<Component> header = () -> GuestHeaders.inHouseHeader(stayId);

  @Section("Cuenta de la estancia")
  @Label("")
  Callable<Component> cuenta =
      () -> {
        var folio = FrontOffice.stayView(stayId).folio();
        var balance = folio == null ? 0 : folio.balance().doubleValue();
        var preauth =
            folio == null || folio.preauthorized() == null
                ? Math.max(balance, 1)
                : folio.preauthorized().doubleValue();
        var consumido = Math.round(balance / preauth * 100);
        return HorizontalLayout.builder()
            .spacing(true)
            .fullWidth(true)
            .flexGrows(List.of(1, 1))
            .content(
                List.of(
                    Meter.builder()
                        .label("BALANCE ACTUAL")
                        .value(balance)
                        .max(preauth)
                        .unit("€")
                        .caption(consumido + "% de la preautorización consumido")
                        .warnAt(preauth * 0.8)
                        .dangerAt(preauth * 0.95)
                        .style("flex: 1;")
                        .build(),
                    Meter.builder()
                        .label("PREAUTORIZACIÓN")
                        .value(preauth)
                        .max(preauth)
                        .unit("€")
                        .caption("Margen disponible: " + GuestHeaders.euros(preauth - balance))
                        .style("flex: 1;")
                        .build()))
            .build();
      };

  @Section("Incidencias y quejas en estancia")
  @Audience("Staff")
  @Label("")
  Callable<Component> incidencias =
      () -> {
        var stay = FrontOffice.stayView(stayId).stay();
        if (stay.incidents().isEmpty()) {
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
            .items(stay.incidents().stream().map(EnCasaDetail::incident).toList())
            .build();
      };

  static StatusItem incident(Incident incident) {
    var status =
        switch (incident.status()) {
          case OPEN -> "Abierta";
          case IN_PROGRESS -> "En curso";
          case RESOLVED -> "Resuelta";
        };
    var color =
        switch (incident.status()) {
          case OPEN -> incident.complaint() ? "error" : "warning";
          case IN_PROGRESS -> "normal";
          case RESOLVED -> "success";
        };
    return StatusItem.builder()
        .id(incident.code())
        .icon(incident.icon())
        .title(incident.title())
        .description(incident.description())
        .status(status)
        .statusColor(color)
        .build();
  }

  @Section("Acompañantes")
  @Label("")
  Callable<Component> acompanantes =
      () -> {
        var stay = FrontOffice.stayView(stayId).stay();
        if (stay.companions().isEmpty()) {
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
                stay.companions().stream()
                    .map(
                        c ->
                            StatusItem.builder()
                                .id(c.companionId())
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
  Callable<Component> historico =
      () -> {
        var guest = FrontOffice.stayView(stayId).guest();
        return HorizontalLayout.builder()
            .spacing(true)
            .fullWidth(true)
            .flexGrows(List.of(1, 1, 1, 1, 1))
            .content(
                List.of(
                    stat("estancias", "ESTANCIAS", guest.stays()),
                    stat("noches", "NOCHES", guest.nights()),
                    stat("anos", "AÑOS CLIENTE", guest.yearsAsClient()),
                    stat("quejas", "QUEJAS HISTÓRICAS", guest.complaints()),
                    stat("hoteles", "HOTELES VISITADOS", guest.hotels())))
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
    if (stayId == null || stayId.isBlank()) {
      stayId = GuestHeaders.idFromRoute(httpRequest, "encasa");
    }
  }
}
