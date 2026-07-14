package io.mateu.mdd.demoadminpanel.infra.in.ui.frontoffice;

import io.mateu.uidl.annotations.Audience;
import io.mateu.uidl.annotations.Multiline;
import io.mateu.uidl.annotations.PlainText;
import io.mateu.uidl.annotations.Section;
import io.mateu.uidl.annotations.Stereotype;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.Toolbar;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.data.Message;
import java.math.BigDecimal;

/**
 * Persona projection ({@code @Audience}): ONE declared check-in model, projected per audience. The
 * "Modo" selector on the app header (the {@code @AppContext} enum field named {@code audience} on
 * {@link io.mateu.mdd.demoadminpanel.infra.in.ui.Home2}) switches the projection: unset → the full
 * model; Staff → internal notes + folio balance (and the audit action); Cliente → the welcome
 * message. A UX projection aid, NOT security — combine with {@code @EyesOnly} for real access
 * control.
 */
@UI("/audience-demo")
@Title("Check-in — proyección por audiencia")
public class AudienceDemo {

  // ── Shared by every audience ────────────────────────────────────────────────
  @Section("Reserva")
  @PlainText
  String bookingCode = "B-2041";

  @PlainText String room = "312 — Doble superior vista mar";

  @PlainText String guest = "Marta García (2 adultos, 1 niño)";

  // ── Cliente-only: the guest-facing welcome ──────────────────────────────────
  @Audience("Cliente")
  @PlainText
  @Multiline
  String welcome =
      "¡Bienvenida, Marta! Su habitación estará lista a las 14:00. El desayuno se sirve de 7:30 a"
          + " 10:30 en la terraza.";

  // ── Staff-only: the operational view ────────────────────────────────────────
  @Section("Solo staff")
  @Audience("Staff")
  @PlainText
  @Multiline
  String internalNotes = "VIP repetidor; llegada tardía prevista (~22:00). Upgrade aprobado por JR.";

  @Audience("Staff")
  @Stereotype(FieldStereotype.money)
  @PlainText
  BigDecimal folioBalance = new BigDecimal("236.50");

  @Audience("Staff")
  @Toolbar
  public Message audit() {
    return new Message("Movimientos del folio auditados");
  }
}
