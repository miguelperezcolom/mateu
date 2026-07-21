package io.mateu.explorer.ui;

import io.mateu.core.infra.declarative.orchestrators.foldout.Foldout;
import io.mateu.uidl.annotations.Panel;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Markdown;

/**
 * Foldout screen for the Explorer — the first non-{@code @Panel} field is the always-visible
 * overview; each {@code @Panel} field is a lateral panel the user folds in and out. Rendered by the
 * redwood-spectra renderer as an Oracle Spectra {@code <oj-sp-foldout-layout>}.
 */
@UI("/foldout")
@Title("Booking 2026-08117")
public class FoldoutDemo extends Foldout {

  Markdown overview =
      new Markdown(
          """
          ### Booking 2026-08117

          **Guest:** Jane Smith
          **Hotel:** Playa Azul
          **Dates:** 12–19 Aug 2026
          **Room:** Double superior, sea view
          **Status:** Confirmed

          Total: **1.240 €** · Paid: 620 €
          """,
          null,
          null);

  @Panel(title = "Payments", subtitle = "Charges and refunds")
  Markdown payments =
      new Markdown(
          """
          | Date | Concept | Amount |
          |---|---|---|
          | 02/05 | Deposit | 620 € |
          | 12/08 | Balance | pending |
          """,
          null,
          null);

  @Panel(title = "Notes", subtitle = "Front-desk notes", open = false)
  Markdown notes =
      new Markdown(
          """
          - Late checkout requested (until 14:00)
          - Allergy: shellfish
          - Anniversary trip — welcome amenity sent
          """,
          null,
          null);
}
