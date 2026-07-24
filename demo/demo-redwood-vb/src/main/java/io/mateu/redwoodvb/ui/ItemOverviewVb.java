package io.mateu.redwoodvb.ui;

import io.mateu.core.infra.declarative.orchestrators.itemoverview.ItemOverview;
import io.mateu.uidl.annotations.Panel;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Markdown;

/**
 * ItemOverview archetype rendered by the Mateu-on-Visual-Builder renderer: key info pinned on the
 * left, the rest of the page organised in tabs on the right.
 */
@UI("/item-overview-vb")
@Title("Silla ergonómica EC-200")
public class ItemOverviewVb extends ItemOverview {

  Markdown keyInfo =
      new Markdown(
          """
          ### Silla ergonómica EC-200

          **SKU:** EC-200-BLK
          **Categoría:** Asientos de oficina
          **Estado:** Activa
          **Stock:** 143 unidades
          **Precio:** 349 €

          Soporte lumbar, reposabrazos 4D, respaldo de malla.
          """,
          null,
          null);

  @Panel(title = "Especificaciones")
  Markdown specs =
      new Markdown(
          """
          | Propiedad | Valor |
          |---|---|
          | Carga máxima | 130 kg |
          | Altura del asiento | 44–54 cm |
          | Materiales | Malla, aluminio |
          | Garantía | 5 años |
          """,
          null,
          null);

  @Panel(title = "Opiniones")
  Markdown reviews =
      new Markdown(
          """
          **4,6 / 5** · 128 opiniones

          - “Muy cómoda para largas jornadas.”
          - “El soporte lumbar se nota desde el primer día.”
          - “Montaje sencillo en 10 minutos.”
          """,
          null,
          null);

  @Panel(title = "Envío")
  Markdown shipping =
      new Markdown(
          """
          Envío gratuito en 24–48 h para pedidos superiores a 200 €.
          Devoluciones sin coste durante 30 días.
          """,
          null,
          null);
}
