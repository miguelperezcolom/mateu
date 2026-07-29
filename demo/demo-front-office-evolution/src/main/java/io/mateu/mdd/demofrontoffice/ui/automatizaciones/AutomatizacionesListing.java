package io.mateu.mdd.demofrontoffice.ui.automatizaciones;

import io.mateu.mdd.demofrontoffice.domain.automation.Automation;
import io.mateu.mdd.demofrontoffice.domain.automation.ConnectedSystem;
import io.mateu.mdd.demofrontoffice.ui.common.FrontOffice;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.Trigger;
import io.mateu.uidl.annotations.TriggerType;
import io.mateu.uidl.data.ColumnAction;
import io.mateu.uidl.data.ColumnActionGroup;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.SearchRequest;
import io.mateu.uidl.data.UICommand;
import io.mateu.uidl.interfaces.Filterable;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Listing;
import io.mateu.uidl.interfaces.Searchable;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

/**
 * Automatizaciones como LISTADO con smart search (mismo patrón que Reservas): una fila por
 * proceso con sus contadores y el estado, chips de vista rápida por el enum del filtro, y la
 * ACCIÓN "Solucionar" en la propia fila ({@link ColumnActionGroup} → {@code action-on-row-*})
 * para los procesos con warnings/errores — al arreglar, el listado se refresca por el bus.
 */
@Route(value = "/automatizaciones", parentRoute = "")
@Title("Automatizaciones")
@Trigger(type = TriggerType.OnLoad, actionId = "search")
@Trigger(type = TriggerType.OnCustomEvent, actionId = "search", eventName = "automatizacion-arreglada")
public class AutomatizacionesListing
    implements Listing<AutomatizacionesListing.Proceso>,
        Searchable,
        Filterable<AutomatizacionesListing.Filtros> {

  /** Vista rápida por estado (chips junto al smart search). */
  public enum Estado {
    @Label("Con errores")
    ERRORES,
    @Label("Con warnings")
    WARNINGS,
    @Label("OK")
    OK
  }

  public static class Filtros {
    @Label("Estado")
    Estado estado;
  }

  public record Proceso(
      String id,
      @Label("Proceso") String proceso,
      @Label("Sistemas") String sistemas,
      @Label("OK") long ok,
      @Label("Warnings") long warnings,
      @Label("Errores") long errores,
      @io.mateu.uidl.annotations.Status(
              mappings = {
                @io.mateu.uidl.annotations.StatusMapping(
                    from = "OK",
                    to = io.mateu.uidl.data.StatusType.SUCCESS),
                @io.mateu.uidl.annotations.StatusMapping(
                    from = "Warnings",
                    to = io.mateu.uidl.data.StatusType.WARNING),
                @io.mateu.uidl.annotations.StatusMapping(
                    from = "Errores",
                    to = io.mateu.uidl.data.StatusType.DANGER)
              },
              defaultStatus = io.mateu.uidl.data.StatusType.NONE)
          @Label("Estado")
          String estado,
      @Label("") ColumnActionGroup acciones) {}

  @Override
  public ListingData<Proceso> search(SearchRequest request, HttpRequest httpRequest) {
    var searchText = request.searchText();
    var filtros = filters(request);
    var rows =
        FrontOffice.automations().findAll().stream()
            .filter(a -> matchesEstado(a, filtros == null ? null : filtros.estado))
            .map(AutomatizacionesListing::row)
            .filter(row -> matches(row, searchText))
            .toList();
    return ListingData.from(rows);
  }

  private static boolean matchesEstado(Automation automation, Estado estado) {
    if (estado == null) {
      return true;
    }
    return switch (estado) {
      case ERRORES -> automation.errorCount() > 0;
      case WARNINGS -> automation.warningCount() > 0 && automation.errorCount() == 0;
      case OK -> automation.warningCount() == 0 && automation.errorCount() == 0;
    };
  }

  private static Proceso row(Automation automation) {
    var actionable = automation.warningCount() > 0 || automation.errorCount() > 0;
    return new Proceso(
        automation.id(),
        automation.name(),
        automation.systems().stream().map(ConnectedSystem::name).collect(Collectors.joining(" · ")),
        automation.okCount(),
        automation.warningCount(),
        automation.errorCount(),
        switch (automation.status()) {
          case OK -> "OK";
          case WARNING -> "Warnings";
          case ERROR -> "Errores";
        },
        new ColumnActionGroup(
            actionable
                ? new ColumnAction[] {new ColumnAction("solucionar", "Solucionar")}
                : new ColumnAction[0]));
  }

  private static boolean matches(Proceso row, String searchText) {
    if (searchText == null || searchText.isBlank()) {
      return true;
    }
    var hay = (row.proceso() + " " + row.sistemas() + " " + row.estado()).toLowerCase(Locale.ROOT);
    for (var word : searchText.trim().toLowerCase(Locale.ROOT).split("\\s+")) {
      if (!hay.contains(word)) {
        return false;
      }
    }
    return true;
  }

  /** La acción de FILA: resuelve los warnings del proceso (dominio real) y refresca por el bus. */
  public Object solucionar(HttpRequest httpRequest) {
    var id = rowId(httpRequest);
    var automation = id == null ? null : FrontOffice.automations().findById(id).orElse(null);
    if (automation == null) {
      return new Message("Proceso no encontrado");
    }
    var resolved = FrontOffice.automations().save(automation.resolveWarnings());
    return List.of(
        new Message("✅ " + resolved.name() + " — incidencias resueltas"),
        UICommand.dispatchEvent("automatizacion-arreglada"));
  }

  /** El id de la fila en ambos contratos: {@code _clickedRow} (el canónico del renderer
   *  compartido — la fila entera) o {@code id} directo (el renderer VB). */
  private static String rowId(HttpRequest httpRequest) {
    var parameters = httpRequest.runActionRq().parameters();
    if (parameters.get("_clickedRow") instanceof java.util.Map<?, ?> row && row.get("id") != null) {
      return String.valueOf(row.get("id"));
    }
    var direct = parameters.get("id");
    return direct == null ? null : String.valueOf(direct);
  }
}
