package io.mateu.mdd.demofrontoffice.ui.common;

import io.mateu.mdd.demofrontoffice.domain.stay.Companion;
import io.mateu.mdd.demofrontoffice.domain.stay.Stay;

/**
 * Per-pax identity operations of a reservation, shared by the Reserva 360 (per-row scan / manual
 * registration) and kept consistent with the check-in wizard's Documento island: pax 1 is the
 * stay's main guest (Guest aggregate), pax 2..N are the stay's companions.
 */
public final class Paxes {

  private Paxes() {}

  /** The pax's current cardex data — for pre-filling the manual registration/edit form. */
  public record PaxData(String document, String name, String email, String phone) {}

  public static PaxData dataOf(String stayId, int pax) {
    if (pax <= 1) {
      var guest = FrontOffice.stayView(stayId).guest();
      return new PaxData(guest.document(), guest.name(), guest.email(), guest.phone());
    }
    var companion = FrontOffice.stayView(stayId).stay().companionAt(pax);
    if (companion == null) {
      return new PaxData(null, "Huésped " + pax, null, null);
    }
    return new PaxData(
        companion.document(), companion.name(), companion.email(), companion.phone());
  }

  /** Whether the pax's identity is verified (main guest or companion). */
  public static boolean identityComplete(String stayId, int pax) {
    if (pax <= 1) {
      return FrontOffice.stayView(stayId).guest().identityComplete();
    }
    var companion = FrontOffice.stayView(stayId).stay().companionAt(pax);
    return companion != null && companion.identityComplete();
  }

  /** The pax's display name (falls back to the pending-slot name). */
  public static String nameOf(String stayId, int pax) {
    if (pax <= 1) {
      return FrontOffice.stayView(stayId).guest().name();
    }
    var companion = FrontOffice.stayView(stayId).stay().companionAt(pax);
    return companion != null ? companion.name() : "Huésped " + pax;
  }

  /** How many of the stay's pax still lack a verified identity (main guest included). */
  public static int paxPendientes(Stay stay) {
    // un pax marcado NO SHOW no cuenta: su documentación ya no se espera
    var ops = FrontOffice.checkInOps().of(stay.id());
    int faltan = 0;
    var view = FrontOffice.stayView(stay.id());
    if (!ops.isNoShow(1) && !view.guest().identityComplete()) {
      faltan++;
    }
    for (int i = 0; i < stay.companions().size(); i++) {
      if (!ops.isNoShow(i + 2) && !stay.companions().get(i).identityComplete()) {
        faltan++;
      }
    }
    for (int paxN = 2 + stay.companions().size(); paxN <= stay.pax(); paxN++) {
      if (!ops.isNoShow(paxN)) {
        faltan++;
      }
    }
    return faltan;
  }

  /** The same demo shortcut the wizard's island offers: verify + fill the contact data. */
  public static void scan(String stayId, int pax) {
    if (pax <= 1) {
      var guest = FrontOffice.stayView(stayId).guest();
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
      FrontOffice.guests().save(guest);
      return;
    }
    var stay = FrontOffice.stayView(stayId).stay();
    var companion = stay.companionAt(pax);
    if (companion == null) {
      companion = Companion.pending(pax);
    }
    if (!companion.identityComplete()) {
      var document =
          companion.document() == null || companion.document().isBlank()
              ? "ESC-" + stay.id().toUpperCase() + "-P" + pax
              : companion.document();
      companion = companion.verifyIdentity(document);
    }
    if (companion.email() == null || companion.email().isBlank()) {
      companion =
          companion.updateContact(
              companion.name().toLowerCase().replace(' ', '.').replace("é", "e") + "@email.com",
              companion.phone() == null || companion.phone().isBlank()
                  ? "+00 000 000 000"
                  : companion.phone());
    }
    FrontOffice.stays().save(stay.registerCompanion(pax, companion));
  }

  /** Manual registration at the desk: document + name + contact in one go. */
  public static void register(
      String stayId, int pax, String document, String name, String email, String phone) {
    if (pax <= 1) {
      var guest = FrontOffice.stayView(stayId).guest();
      var doc =
          document == null || document.isBlank() ? "MAN-" + guest.id().toUpperCase() : document;
      FrontOffice.guests().save(guest.verifyIdentity(doc).updateContact(email, phone));
      return;
    }
    var stay = FrontOffice.stayView(stayId).stay();
    var companion = stay.companionAt(pax);
    if (companion == null) {
      companion = Companion.pending(pax);
    }
    var doc =
        document == null || document.isBlank()
            ? "MAN-" + stay.id().toUpperCase() + "-P" + pax
            : document;
    FrontOffice.stays()
        .save(
            stay.registerCompanion(
                pax, companion.rename(name).verifyIdentity(doc).updateContact(email, phone)));
  }
}
