package io.mateu.mdd.demofrontoffice.ui.checkin;

import io.mateu.core.infra.declarative.orchestrators.wizard.Wizard;
import io.mateu.mdd.demofrontoffice.domain.folio.Folio;
import io.mateu.mdd.demofrontoffice.domain.folio.FolioLine;
import io.mateu.mdd.demofrontoffice.domain.stay.StayStatus;
import io.mateu.mdd.demofrontoffice.ui.common.FrontOffice;
import io.mateu.mdd.demofrontoffice.ui.common.GuestHeaders;
import io.mateu.uidl.StyleConstants;
import io.mateu.uidl.annotations.*;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.UICommand;
import io.mateu.uidl.fluent.Action;
import io.mateu.uidl.interfaces.HttpRequest;
import java.time.Duration;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * The check-in flow of one arriving stay (route {@code /checkin/:id}): Identidad → Habitación →
 * Extras → Confirmar, plus the read-only result screen. Every step opens with the guest's
 * {@code EntityHeader} so the context never leaves the screen; the room grid, the upgrade offer and
 * the add-on picker dispatch their actions back into this wizard.
 *
 * <p>State is handled by the framework: every step's fields are serialized into the component
 * state and rehydrated on each request, so values entered or set in ANY step survive navigation
 * and actions for the wizard's lifetime. The wizard itself only seeds the steps once per stay
 * ({@link #populate()}), keeps the Confirmar summary derived from the other steps
 * ({@link #syncConfirmar()}), and reacts to the actions its step components dispatch. Confirming
 * runs the real domain lifecycle: assign the room, check the stay in, occupy the room and open the
 * folio with the accommodation and add-on charges.
 */
@Route(value = "/checkin/:id", parentRoute = "")
@Title("Check-In")
@Style(StyleConstants.CONTAINER)
@WizardProgress(WizardProgressStyle.STEPS)
// a scan changes the registroPax colors (per-pax green + band theme) — re-render the step
@SubscribeTo(event = "documento-escaneado", action = "refrescarIdentidad")
// the tablet-signature and pre-authorization SSE fluxes end by dispatching these events: a
// fragment emitted 5 s into the stream would be dropped (the first emission rotated the
// component's callbackToken), so the green state arrives via a FRESH action instead
@SubscribeTo(event = "firma-capturada", action = "firmaCapturada")
@SubscribeTo(event = "preautorizacion-completada", action = "preautorizado")
public class CheckInWizard extends Wizard {

  String stayId;
  boolean populated;
  int selectedPax = 1;

  @Label("Identidad")
  IdentidadStep identidad;

  @Label("Habitación")
  HabitacionStep habitacion = new HabitacionStep();

  @Label("Extras")
  ExtrasStep extras = new ExtrasStep();

  @Label("Confirmar")
  ConfirmarStep confirmar = new ConfirmarStep();

  @Label("Check-in completado")
  ResultStep result;

  // ── Lifecycle ───────────────────────────────────────────────────────────────

  @Override
  public void onHydrated(HttpRequest httpRequest) {
    super.onHydrated(httpRequest);
    var id = GuestHeaders.idFromRoute(httpRequest, "checkin");
    if (id != null && !id.equals(stayId)) {
      stayId = id;
      populated = false;
      selectedPax = 1;
    }
    if (!populated) {
      populated = true;
      populate();
    }
    identidad = new IdentidadStep();
    identidad.setSelectedPax(selectedPax);
    identidad.load(httpRequest);
    syncConfirmar();
  }

  /** Seeds the steps from the stay's reservation data — once per stay. */
  void populate() {
    var view = FrontOffice.stayView(stayId);
    identidad.setStayId(stayId);
    habitacion.setStayId(stayId);
    habitacion.setHabitacionSeleccionada(view.stay().roomNumber());
    extras.setStayId(stayId);
    extras.setExtrasSeleccionados("");
    extras.setExtrasTotal(0);
    confirmar.setStayId(stayId);
  }

  /** The Confirmar step shows data derived from the other steps — recompute it on each request. */
  void syncConfirmar() {
    var view = FrontOffice.stayView(stayId);
    var stay = view.stay();
    confirmar.setHuespedPrincipal(view.guest().name());
    var room =
        habitacion.getHabitacionSeleccionada() != null
            ? habitacion.getHabitacionSeleccionada()
            : stay.roomNumber();
    confirmar.setHabitacionAsignada(room + " — " + roomTypeOf(room, stay.roomType()));
    confirmar.setEstancia(GuestHeaders.stayDates(stay));
    confirmar.setRegimen(stay.board());
    confirmar.setTotalEstancia(stay.total().doubleValue() + extras.getExtrasTotal());
  }

  /** The selected room's type from the room inventory, falling back to the reservation's. */
  static String roomTypeOf(String roomNumber, String fallback) {
    return FrontOffice.rooms()
        .findByNumber(roomNumber)
        .map(r -> r.type() != null ? r.type() : "Planta " + r.floor())
        .orElse(fallback);
  }

  // ── Actions dispatched by the step components ──────────────────────────────

  @Override
  public Object handleAction(String actionId, HttpRequest httpRequest) {
    switch (actionId) {
      case "pickRoom" -> {
        var item = param(httpRequest, "_item");
        if (item != null) {
          habitacion.setHabitacionSeleccionada(item);
          syncConfirmar();
        }
        return this;
      }
      case "upgrade" -> {
        // toggle: the offer card's CTA turns green ("✓ Upgrade añadido") while active
        habitacion.setUpgradeAnadido(!habitacion.isUpgradeAnadido());
        syncConfirmar();
        return List.of(
            this,
            new Message(
                habitacion.isUpgradeAnadido()
                    ? "Upgrade aplicado — Master Oceanfront Suite (+ € 65 / noche)"
                    : "Upgrade retirado"));
      }
      case "extrasChanged" -> {
        var params = httpRequest.runActionRq().parameters();
        var item = String.valueOf(params.get("_item"));
        var added = Boolean.parseBoolean(String.valueOf(params.get("_added")));
        var ids = new LinkedHashSet<>(extras.addedIds());
        if (added) {
          ids.add(item);
        } else {
          ids.remove(item);
        }
        extras.setExtrasSeleccionados(String.join(",", ids));
        if (params.get("_total") instanceof Number total) {
          extras.setExtrasTotal(total.doubleValue());
        }
        syncConfirmar();
        return this;
      }
      case "selectPax" -> {
        var raw = param(httpRequest, "paxIndex");
        if (raw != null) {
          selectedPax = (int) Double.parseDouble(raw);
          identidad.setSelectedPax(selectedPax);
          identidad.load(httpRequest);
        }
        // re-render the step (selected button) AND re-point the Documento island to the pax
        return List.of(
            this, UICommand.dispatchEvent("pax-seleccionado", Map.of("paxIndex", selectedPax)));
      }
      case "refrescarIdentidad" -> {
        return this;
      }
      case "encodeKey" -> {
        return new Message("Llave / pulsera grabada");
      }
      case "requestPreauth" -> {
        // SSE: re-render immediately as "Solicitando preautorización…"; 5 s later (the TPV
        // answers) dispatch preautorizacion-completada — the @SubscribeTo above reloads.
        confirmar.setPreauthEstado("solicitando");
        return Flux.concat(
            Flux.<Object>just(
                List.of(
                    this,
                    new Message(
                        "Preautorización solicitada — "
                            + GuestHeaders.euros(confirmar.getTotalEstancia())
                            + " en la tarjeta del huésped"))),
            Mono.delay(Duration.ofSeconds(5))
                .map(tick -> (Object) UICommand.dispatchEvent("preautorizacion-completada")));
      }
      case "preautorizado" -> {
        confirmar.setPreauthEstado("preautorizado");
        return List.of(
            this,
            new Message(
                "Preautorizado — " + GuestHeaders.euros(confirmar.getTotalEstancia())));
      }
      case "sendToTablet" -> {
        // SSE: re-render immediately as "Enviado · Esperando firma"; 5 s later (the guest signs
        // on the tablet) dispatch firma-capturada — the @SubscribeTo above reloads the wizard.
        confirmar.setFirmaEstado("enviada");
        return Flux.concat(
            Flux.<Object>just(
                List.of(this, new Message("Documento de registro enviado a la tablet Civitfun"))),
            Mono.delay(Duration.ofSeconds(5))
                .map(tick -> (Object) UICommand.dispatchEvent("firma-capturada")));
      }
      case "firmaCapturada" -> {
        confirmar.setFirmaEstado("firmada");
        return List.of(this, new Message("Firma capturada"));
      }
      default -> {
        var result = super.handleAction(actionId, httpRequest);
        syncConfirmar();
        return result;
      }
    }
  }

  static String param(HttpRequest httpRequest, String name) {
    var rq = httpRequest.runActionRq();
    if (rq == null || rq.parameters() == null || rq.parameters().get(name) == null) {
      return null;
    }
    return String.valueOf(rq.parameters().get(name));
  }

  // advertise the component-dispatched action ids so the frontend sends them to this component
  @Override
  public List<Action> actions(HttpRequest httpRequest) {
    var actions = new ArrayList<>(super.actions(httpRequest));
    for (var id :
        List.of(
            "pickRoom",
            "upgrade",
            "extrasChanged",
            "selectPax",
            "refrescarIdentidad",
            "encodeKey",
            "firmaCapturada",
            "preautorizado")) {
      actions.add(Action.builder().id(id).build());
    }
    // stream two increments each: the in-flight state now, the confirmation 5 s later
    actions.add(Action.builder().id("sendToTablet").sse(true).build());
    actions.add(Action.builder().id("requestPreauth").sse(true).build());
    return actions;
  }

  // ── Completion ──────────────────────────────────────────────────────────────

  @WizardCompletionAction
  @Label("Confirmar check-in")
  void confirmarCheckin() {
    syncConfirmar();
    var view = FrontOffice.stayView(stayId);
    var stay = view.stay();
    if (stay.status() == StayStatus.ARRIVING) {
      var selected =
          habitacion.getHabitacionSeleccionada() != null
              ? habitacion.getHabitacionSeleccionada()
              : stay.roomNumber();
      stay = stay.assignRoom(selected, roomTypeOf(selected, stay.roomType()));
      for (var addOnId : extras.addedIds()) {
        stay = stay.addAddOn(addOnId);
      }
      stay = FrontOffice.stays().save(stay.completeCheckIn());
      FrontOffice.rooms()
          .findByNumber(selected)
          .filter(room -> room.assignable())
          .ifPresent(room -> FrontOffice.rooms().save(room.occupy()));
      if (view.folio() == null) {
        var folio =
            Folio.openFor("f-" + stay.id(), stay.id(), stay.total())
                .post(FolioLine.charge("Alojamiento x" + stay.nights() + " noches", stay.total()));
        for (var addOn : stay.addOns()) {
          var item = FrontOffice.addOnCatalog().findById(addOn.addOnId()).orElse(null);
          if (item != null && item.price() != null) {
            folio = folio.post(FolioLine.charge(item.title(), item.price()));
          }
        }
        FrontOffice.folios().save(folio);
      }
    }
    result = new ResultStep();
    result.setStayId(stayId);
    result.setHabitacionFinal(confirmar.getHabitacionAsignada());
    result.setMensaje(
        "✅ Check-in completado — "
            + confirmar.getHuespedPrincipal()
            + " · Habitación "
            + confirmar.getHabitacionAsignada());
  }
}
