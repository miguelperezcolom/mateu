package io.mateu.mdd.demofrontoffice.ui.automatizaciones;

import io.mateu.mdd.demofrontoffice.data.HotelData;
import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.Audience;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.Section;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.MetricCard;
import io.mateu.uidl.data.MetricTrend;
import io.mateu.uidl.data.ProcessMonitor;
import io.mateu.uidl.data.Scoreboard;
import io.mateu.uidl.fluent.Component;
import java.util.List;

/**
 * The automations monitor (staff-only screen): scope filters, the last-24h scoreboard and the
 * process health board with fix actions.
 */
@Route(value = "/automatizaciones", parentRoute = "")
@Title("Automatizaciones")
public class Automatizaciones {

  public enum HotelFiltro {
    TodosLosHoteles,
    PuntaCana,
    Bavaro,
    Aruba
  }

  public enum PaisFiltro {
    TodosLosPaises,
    RepublicaDominicana,
    Aruba,
    Espana
  }

  public enum ZonaFiltro {
    TodasLasZonas,
    Caribe,
    Atlantico,
    Mediterraneo
  }

  @Audience("Staff")
  @Label("Hotel")
  HotelFiltro hotelFiltro = HotelFiltro.TodosLosHoteles;

  @Audience("Staff")
  @Label("País")
  PaisFiltro pais = PaisFiltro.TodosLosPaises;

  @Audience("Staff")
  @Label("Zona")
  ZonaFiltro zona = ZonaFiltro.TodasLasZonas;

  @Section("Estado general — últimas 24h")
  @Audience("Staff")
  @Label("")
  Component estadoGeneral =
      Scoreboard.builder()
          .style("width: 100%;")
          .metrics(
              List.of(
                  MetricCard.builder()
                      .id("ok")
                      .title("PROCESOS OK")
                      .value("13.017")
                      .trend(MetricTrend.up)
                      .trendLabel("↑ 4,2% vs. ayer")
                      .build(),
                  MetricCard.builder()
                      .id("warnings")
                      .title("WARNINGS")
                      .value("26")
                      .description("Requieren revisión")
                      .build(),
                  MetricCard.builder()
                      .id("errores")
                      .title("ERRORES CRÍTICOS")
                      .value("2")
                      .description("Bloqueantes")
                      .trend(MetricTrend.down)
                      .build(),
                  MetricCard.builder()
                      .id("exito")
                      .title("TASA DE ÉXITO")
                      .value("99,8%")
                      .description("Objetivo: 99,5%")
                      .build()))
          .build();

  @Section("Procesos automatizados")
  @Audience("Staff")
  @Label("")
  Component procesos =
      ProcessMonitor.builder().items(HotelData.processes()).style("width: 100%;").build();

  // ── Fix actions dispatched by the process monitor rows ─────────────────────

  @Action
  Object fixCredit() {
    return new Message("Aquí se abrirían las 6 incidencias de Facturación a Crédito (OHIP · OIC · Voxel)");
  }

  @Action
  Object fixDiscrepancias() {
    return new Message("Aquí se abrirían las 7 discrepancias de reserva (CRS · OHIP · RACK)");
  }

  @Action
  Object fixPrepagos() {
    return new Message("Aquí se abrirían los 4 warnings de Prepagos (OHIP · OIC · FreedomPay)");
  }

  @Action
  Object fixInterhoteles() {
    return new Message("Aquí se abrirían los 4 warnings de Interhoteles (OHIP · Red de Hoteles)");
  }

  @Action
  Object fixNoShow() {
    return new Message("Aquí se abrirían los 5 warnings de No Show y Cancelaciones");
  }

  @Action
  Object fixDigital() {
    return new Message("Aquí se abrirían los 4 warnings de Digital Check-In / Check-Out (Civitfun · SES)");
  }
}
