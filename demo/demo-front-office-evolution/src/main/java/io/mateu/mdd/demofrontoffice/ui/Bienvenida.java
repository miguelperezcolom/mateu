package io.mateu.mdd.demofrontoffice.ui;

import io.mateu.core.infra.declarative.orchestrators.welcome.Welcome;
import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.Panel;
import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.ButtonStyle;
import java.net.URI;

/**
 * La landing de la suite con el arquetipo {@link Welcome} (template RDS de welcome page): hero
 * con las llamadas a la acción y las tres áreas de la suite como tiles. Es la HOME del app
 * ({@code @HomeRoute} en {@link FrontOfficeSuite}).
 */
@Route(value = "/bienvenida", parentRoute = "")
@Title("Front-Office Suite")
public class Bienvenida extends Welcome {

  Button reservas =
      Button.builder()
          .label("Ir a Reservas")
          .actionId("abrirReservas")
          .buttonStyle(ButtonStyle.primary)
          .build();

  Button automatizaciones =
      Button.builder().label("Automatizaciones").actionId("abrirAutomatizaciones").build();

  // los 3 KPIs del día, con los contadores VIVOS del repositorio (la vista se instancia
  // por request, así que los initializers cuentan en cada render)
  @Panel(title = "")
  io.mateu.uidl.data.MetricCard llegadasHoy =
      io.mateu.uidl.data.MetricCard.builder()
          .id("llegadas-hoy")
          .actionId("verLlegadasHoy")
          .title("LLEGADAS HOY")
          .value(String.valueOf(contar(Vista.LLEGADAS)))
          .description("Reservas que entran hoy")
          .build();

  @Panel(title = "")
  io.mateu.uidl.data.MetricCard enCasa =
      io.mateu.uidl.data.MetricCard.builder()
          .id("en-casa")
          .actionId("verEnCasa")
          .title("IN HOUSE")
          .value(String.valueOf(contar(Vista.EN_CASA)))
          .description("Huéspedes en casa")
          .build();

  @Panel(title = "")
  io.mateu.uidl.data.MetricCard salidasHoy =
      io.mateu.uidl.data.MetricCard.builder()
          .id("salidas-hoy")
          .actionId("verSalidasHoy")
          .title("SALIDAS HOY")
          .value(String.valueOf(contar(Vista.SALIDAS)))
          .description("Check-outs previstos hoy")
          .build();

  private enum Vista { LLEGADAS, SALIDAS, EN_CASA }

  private static long contar(Vista vista) {
    var today = java.time.LocalDate.now();
    return io.mateu.mdd.demofrontoffice.ui.common.FrontOffice.stays().findAll().stream()
        .filter(s -> switch (vista) {
          case LLEGADAS ->
              s.status() == io.mateu.mdd.demofrontoffice.domain.stay.StayStatus.ARRIVING
                  && !s.checkIn().isAfter(today);
          case SALIDAS ->
              s.status() != io.mateu.mdd.demofrontoffice.domain.stay.StayStatus.ARRIVING
                  && s.checkOut().isEqual(today);
          case EN_CASA ->
              s.status() == io.mateu.mdd.demofrontoffice.domain.stay.StayStatus.IN_HOUSE;
        })
        .count();
  }

  @Override
  protected String heroTitle() {
    return "Front-Office Suite";
  }

  @Override
  protected String heroSubtitle() {
    return "Recepción y automatización del hotel — llegadas, estancias y salidas en una sola vista";
  }

  @Action
  Object abrirReservas() {
    return URI.create("/reservas");
  }

  // cada KPI abre el listado con SU vista aplicada — el filtro viaja en la URL
  // (?vista=...) y el renderer lo aplica como selector rápido al aterrizar
  @Action
  Object verLlegadasHoy() {
    return URI.create("/reservas?vista=LLEGADAS_HOY");
  }

  @Action
  Object verEnCasa() {
    return URI.create("/reservas?vista=IN_HOUSE");
  }

  @Action
  Object verSalidasHoy() {
    return URI.create("/reservas?vista=SALIDAS_HOY");
  }

  @Action
  Object abrirAutomatizaciones() {
    return URI.create("/automatizaciones");
  }
}
