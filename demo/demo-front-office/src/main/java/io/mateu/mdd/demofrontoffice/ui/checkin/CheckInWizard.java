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
 * <p>NOTE on state: only the CURRENT step is rehydrated from the component state on each request —
 * the other step objects reset to their field initializers. All cross-step data therefore lives in
 * wizard-level fields (whose names match the step field names, so the shared flat state keys feed
 * both) and is pushed back into every step before rendering ({@link #push()}).
 */
@Route(value = "/checkin/:id", parentRoute = "")
@Title("Check-In")
public class CheckInWizard extends Wizard {

  // ── Cross-step state (mirrors of the step fields, same names → same flat state keys) ──
  String guestId;
  boolean populated;
  String documento;
  String nombre;
  String email;
  String telefono;
  String habitacionSeleccionada;
  String extrasSeleccionados;
  String extrasTotal;

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
    push();
    syncConfirmar();
  }

  void populate() {
    var g = HotelData.arrival(guestId);
    documento = g.verified() ? "✓ Verificado — " + g.doc() : "Pendiente de escaneo de documento";
    nombre = g.name();
    email = g.email();
    telefono = g.phone();
    habitacionSeleccionada = g.room();
    extrasSeleccionados = "";
    extrasTotal = "0";
  }

  /** Pushes the wizard-level state into every step (steps reset to initializers on rebuild). */
  void push() {
    identidad.setGuestId(guestId);
    habitacion.setGuestId(guestId);
    extras.setGuestId(guestId);
    confirmar.setGuestId(guestId);
    if (documento != null) {
      identidad.setDocumento(documento);
    }
    if (nombre != null) {
      identidad.setNombre(nombre);
    }
    if (email != null) {
      identidad.setEmail(email);
    }
    if (telefono != null) {
      identidad.setTelefono(telefono);
    }
    if (habitacionSeleccionada != null) {
      habitacion.setHabitacionSeleccionada(habitacionSeleccionada);
    }
    if (extrasSeleccionados != null) {
      extras.setExtrasSeleccionados(extrasSeleccionados);
    }
    if (extrasTotal != null) {
      extras.setExtrasTotal(extrasTotal);
    }
    if (result != null) {
      result.setGuestId(guestId);
    }
  }

  void syncConfirmar() {
    var g = HotelData.arrival(guestId);
    confirmar.setHuespedPrincipal(nombre == null || nombre.isBlank() ? g.name() : nombre);
    var room = habitacionSeleccionada != null ? habitacionSeleccionada : g.room();
    confirmar.setHabitacionAsignada(
        g.room().equals(room)
            ? room + " — " + g.roomType()
            : room + " — Planta " + (room.length() >= 2 ? room.substring(0, 2) : room));
    confirmar.setEstancia(g.stay());
    confirmar.setRegimen(g.board());
    confirmar.setTotalEstancia(g.total() + extrasImporte());
  }

  double extrasImporte() {
    try {
      return extrasTotal == null || extrasTotal.isBlank() ? 0.0 : Double.parseDouble(extrasTotal);
    } catch (NumberFormatException e) {
      return 0.0;
    }
  }

  // ── Actions dispatched by the step components ──────────────────────────────

  @Override
  public Object handleAction(String actionId, HttpRequest httpRequest) {
    switch (actionId) {
      case "pickRoom" -> {
        var item = param(httpRequest, "_item");
        if (item != null) {
          habitacionSeleccionada = item;
          push();
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
        extrasSeleccionados = String.join(",", ids);
        if (params.get("_total") instanceof Number total) {
          extrasTotal = String.valueOf(total.doubleValue());
        }
        push();
        syncConfirmar();
        return this;
      }
      case "addPax" -> {
        return new Message("Aquí se registraría el siguiente huésped de la reserva (demo)");
      }
      case "simularEscaneo" -> {
        var g = HotelData.arrival(guestId);
        documento = "✓ Verificado — escaneo correcto";
        nombre = g.name();
        email =
            g.email() == null || g.email().isBlank()
                ? g.name().toLowerCase().replace(' ', '.').replace("í", "i").replace("é", "e")
                    + "@email.com"
                : g.email();
        telefono = g.phone() == null || g.phone().isBlank() ? "+00 000 000 000" : g.phone();
        push();
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
        push();
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
    push();
  }
}
