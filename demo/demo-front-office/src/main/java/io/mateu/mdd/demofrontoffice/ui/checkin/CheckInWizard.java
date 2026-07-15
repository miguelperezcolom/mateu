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
import io.mateu.uidl.fluent.Action;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;

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
public class CheckInWizard extends Wizard {

  String stayId;
  boolean populated;

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
    }
    if (!populated) {
      populated = true;
      populate();
    }
    identidad = new IdentidadStep().load(httpRequest);
    syncConfirmar();
  }

  /** Seeds the steps from the stay's reservation data — once per stay. */
  void populate() {
    var view = FrontOffice.stayView(stayId);
    var guest = view.guest();
    identidad.setStayId(stayId);
    identidad.setDocumento(
        guest.identityComplete()
            ? "✓ Verificado — " + guest.document()
            : "Pendiente de escaneo de documento");
    identidad.setNombre(guest.name());
    identidad.setEmail(guest.email());
    identidad.setTelefono(guest.phone());
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
    var nombre = identidad.getNombre();
    confirmar.setHuespedPrincipal(nombre == null || nombre.isBlank() ? view.guest().name() : nombre);
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
        return new Message("Upgrade aplicado — Master Oceanfront Suite (+ € 65 / noche)");
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
      case "addPax" -> {
        return new Message("Aquí se registraría el siguiente huésped de la reserva (demo)");
      }
      case "simularEscaneo" -> {
        var view = FrontOffice.stayView(stayId);
        var guest = view.guest();
        if (!guest.identityComplete()) {
          var document =
              guest.document() == null || guest.document().isBlank()
                  ? "ESC-" + guest.id().toUpperCase()
                  : guest.document();
          guest = guest.verifyIdentity(document);
        }
        if (guest.email() == null || guest.email().isBlank()) {
          guest =
              guest.updateContact(
                  guest.name().toLowerCase().replace(' ', '.').replace("í", "i").replace("é", "e")
                      + "@email.com",
                  guest.phone() == null || guest.phone().isBlank()
                      ? "+00 000 000 000"
                      : guest.phone());
        }
        guest = FrontOffice.guests().save(guest);
        identidad.setDocumento("✓ Verificado — " + guest.document());
        identidad.setNombre(guest.name());
        identidad.setEmail(guest.email());
        identidad.setTelefono(guest.phone());
        return this;
      }
      case "encodeKey" -> {
        return new Message("Llave / pulsera grabada");
      }
      case "sendToTablet" -> {
        return new Message("Documento de registro enviado a la tablet Civitfun");
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
            "addPax",
            "simularEscaneo",
            "encodeKey",
            "sendToTablet")) {
      actions.add(Action.builder().id(id).build());
    }
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
