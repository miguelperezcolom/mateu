package io.mateu.redwoodvb.ui;

import io.mateu.core.infra.declarative.orchestrators.foldout.Foldout;
import io.mateu.uidl.annotations.Panel;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Text;

/**
 * Fase 7 — the {@link Foldout} archetype: the first component field is the always-visible overview;
 * {@code @Panel} fields are lateral panels the user folds in and out (rendered by the VB dispatcher
 * as authentic oj-sp-foldout-layout / oj-sp-foldout-panel).
 */
@UI("/foldout")
@Title("Reserva 2026-08117")
public class BookingFoldout extends Foldout {

  Text overview =
      new Text("ov", "Reserva de Jane Smith · Hotel Playa Azul · 12–19 Ago 2026 · Doble superior · Confirmada");

  @Panel(title = "Pagos", subtitle = "Cargos y reembolsos")
  Text pagos = new Text("pagos", "Depósito 620 € (02/05) · Saldo pendiente 620 € (vence 12/08)");

  @Panel(title = "Ocupación", subtitle = "Ocupación del hotel esa semana")
  Text ocupacion = new Text("ocup", "Ocupación media 82% · Pico sábado 96% · Valle martes 61%");

  @Panel(title = "Notas", subtitle = "Notas internas")
  Text notas = new Text("notas", "Cliente VIP · Solicita cuna · Late check-out concedido");
}
