package io.mateu.mdd.demofrontoffice.ui.automatizaciones;

import io.mateu.mdd.demofrontoffice.domain.automation.Automation;
import io.mateu.mdd.demofrontoffice.domain.automation.ConnectedSystem;
import io.mateu.mdd.demofrontoffice.ui.common.FrontOffice;
import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.Audience;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.annotations.Section;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.MetricCard;
import io.mateu.uidl.data.MetricTrend;
import io.mateu.uidl.data.ProcessItem;
import io.mateu.uidl.data.ProcessMonitor;
import io.mateu.uidl.data.Scoreboard;
import io.mateu.uidl.fluent.Component;
import java.util.List;
import java.util.Locale;
import java.util.concurrent.Callable;

/**
 * The automations monitor (staff-only screen): scope filters, the last-24h scoreboard computed
 * from the automation aggregates and the process health board. The fix actions resolve the
 * process' warnings for real ({@code Automation.resolveWarnings()} → repository) and re-render.
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
  Callable<Component> estadoGeneral =
      () -> {
        var automations = FrontOffice.automations().findAll();
        var ok = automations.stream().mapToInt(Automation::okCount).sum();
        var warnings = automations.stream().mapToInt(Automation::warningCount).sum();
        var errors = automations.stream().mapToInt(Automation::errorCount).sum();
        var total = ok + warnings + errors;
        var successRate = total == 0 ? 100.0 : ok * 100.0 / total;
        return Scoreboard.builder()
            .style("width: 100%;")
            .metrics(
                List.of(
                    MetricCard.builder()
                        .id("ok")
                        .title("PROCESOS OK")
                        .value(grouped(ok))
                        .trend(MetricTrend.up)
                        .trendLabel("↑ 4,2% vs. ayer")
                        .build(),
                    MetricCard.builder()
                        .id("warnings")
                        .title("WARNINGS")
                        .value(grouped(warnings))
                        .description("Requieren revisión")
                        .build(),
                    MetricCard.builder()
                        .id("errores")
                        .title("ERRORES CRÍTICOS")
                        .value(grouped(errors))
                        .description("Bloqueantes")
                        .trend(MetricTrend.down)
                        .build(),
                    MetricCard.builder()
                        .id("exito")
                        .title("TASA DE ÉXITO")
                        .value(String.format(Locale.US, "%.1f%%", successRate).replace('.', ','))
                        .description("Objetivo: 99,5%")
                        .build()))
            .build();
      };

  @Section("Procesos automatizados")
  @Audience("Staff")
  @Label("")
  Callable<Component> procesos =
      () ->
          ProcessMonitor.builder()
              .items(
                  FrontOffice.automations().findAll().stream()
                      .map(Automatizaciones::process)
                      .toList())
              .style("width: 100%;")
              .build();

  static ProcessItem process(Automation automation) {
    var status =
        switch (automation.status()) {
          case OK -> "ok";
          case WARNING -> "warning";
          case ERROR -> "error";
        };
    var actionable = automation.warningCount() > 0 || automation.errorCount() > 0;
    return ProcessItem.builder()
        .id(automation.id())
        .name(automation.name())
        .systems(automation.systems().stream().map(ConnectedSystem::name).toList())
        .ok(automation.okCount())
        .warnings(automation.warningCount())
        .errors(automation.errorCount())
        .status(status)
        .actionLabel(actionable ? "Solucionar" : null)
        .actionId(actionable ? fixActionId(automation.id()) : null)
        .build();
  }

  static String grouped(int value) {
    return String.format(Locale.US, "%,d", value).replace(',', '.');
  }

  // ── Fix actions dispatched by the process monitor rows ─────────────────────
  // The monitor sends the row's actionId with no parameters, so each process needs its own
  // @Action method; all of them resolve the warnings through the Automation aggregate.

  static String fixActionId(String automationId) {
    return switch (automationId) {
      case "credit" -> "fixCredit";
      case "discrepancias" -> "fixDiscrepancias";
      case "prepagos" -> "fixPrepagos";
      case "interhoteles" -> "fixInterhoteles";
      case "comercializadora" -> "fixComercializadora";
      case "noshow" -> "fixNoShow";
      case "digital" -> "fixDigital";
      default -> null;
    };
  }

  Object fix(String automationId) {
    var automation = FrontOffice.automations().findById(automationId).orElse(null);
    if (automation == null) {
      return new Message("Proceso no encontrado: " + automationId);
    }
    var resolved = FrontOffice.automations().save(automation.resolveWarnings());
    return List.of(
        this,
        new Message(
            resolved.name() + " — " + automation.warningCount() + " warnings resueltos"));
  }

  @Action
  Object fixCredit() {
    return fix("credit");
  }

  @Action
  Object fixDiscrepancias() {
    return fix("discrepancias");
  }

  @Action
  Object fixPrepagos() {
    return fix("prepagos");
  }

  @Action
  Object fixInterhoteles() {
    return fix("interhoteles");
  }

  @Action
  Object fixComercializadora() {
    return fix("comercializadora");
  }

  @Action
  Object fixNoShow() {
    return fix("noshow");
  }

  @Action
  Object fixDigital() {
    return fix("digital");
  }
}
