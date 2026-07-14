package io.mateu.mdd.demofrontoffice.ui.checkin;

import io.mateu.core.infra.declarative.orchestrators.wizard.Wizard;
import io.mateu.mdd.demofrontoffice.data.HotelData;
import io.mateu.mdd.demofrontoffice.ui.common.GuestHeaders;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.WizardCompletionAction;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.fluent.Action;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;

/**
 * The check-in flow of one arriving guest (route {@code /checkin/:id}): Identidad → Habitación →
 * Extras → Confirmar, plus the read-only result screen. Every step opens with the guest's
 * {@code EntityHeader} so the context never leaves the screen; the room grid, the upgrade offer and
 * the add-on picker dispatch their actions back into this wizard.
 *
 * <p>State is handled by the framework: every step's fields are serialized into the component
 * state and rehydrated on each request, so values entered or set in ANY step survive navigation
 * and actions for the wizard's lifetime. The wizard itself only seeds the steps once per guest
 * ({@link #populate()}), keeps the Confirmar summary derived from the other steps
 * ({@link #syncConfirmar()}), and reacts to the actions its step components dispatch.
 */
@Route(value = "/checkin/:id", parentRoute = "")
@Title("Check-In")
public class CheckInWizard extends Wizard {

  String guestId;
  boolean populated;

  @Label("Identidad")
  IdentidadStep identidad = new IdentidadStep();

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
    if (id != null && !id.equals(guestId)) {
      guestId = id;
      populated = false;
    }
    if (!populated) {
      populated = true;
      populate();
    }
    syncConfirmar();
  }

  /** Seeds the steps from the guest's reservation data — once per guest. */
  void populate() {
    var g = HotelData.arrival(guestId);
    identidad.setGuestId(guestId);
    identidad.setDocumento(
        g.verified() ? "✓ Verificado — " + g.doc() : "Pendiente de escaneo de documento");
    identidad.setNombre(g.name());
    identidad.setEmail(g.email());
    identidad.setTelefono(g.phone());
    habitacion.setGuestId(guestId);
    habitacion.setHabitacionSeleccionada(g.room());
    extras.setGuestId(guestId);
    extras.setExtrasSeleccionados("");
    extras.setExtrasTotal(0);
    confirmar.setGuestId(guestId);
  }

  /** The Confirmar step shows data derived from the other steps — recompute it on each request. */
  void syncConfirmar() {
    var g = HotelData.arrival(guestId);
    var nombre = identidad.getNombre();
    confirmar.setHuespedPrincipal(nombre == null || nombre.isBlank() ? g.name() : nombre);
    var room =
        habitacion.getHabitacionSeleccionada() != null
            ? habitacion.getHabitacionSeleccionada()
            : g.room();
    confirmar.setHabitacionAsignada(
        g.room().equals(room)
            ? room + " — " + g.roomType()
            : room + " — Planta " + (room.length() >= 2 ? room.substring(0, 2) : room));
    confirmar.setEstancia(g.stay());
    confirmar.setRegimen(g.board());
    confirmar.setTotalEstancia(g.total() + extras.getExtrasTotal());
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
        var g = HotelData.arrival(guestId);
        identidad.setDocumento("✓ Verificado — escaneo correcto");
        identidad.setNombre(g.name());
        identidad.setEmail(
            g.email() == null || g.email().isBlank()
                ? g.name().toLowerCase().replace(' ', '.').replace("í", "i").replace("é", "e")
                    + "@email.com"
                : g.email());
        identidad.setTelefono(
            g.phone() == null || g.phone().isBlank() ? "+00 000 000 000" : g.phone());
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
    result = new ResultStep();
    result.setGuestId(guestId);
    result.setHabitacionFinal(confirmar.getHabitacionAsignada());
    result.setMensaje(
        "✅ Check-in completado — "
            + confirmar.getHuespedPrincipal()
            + " · Habitación "
            + confirmar.getHabitacionAsignada());
  }
}
