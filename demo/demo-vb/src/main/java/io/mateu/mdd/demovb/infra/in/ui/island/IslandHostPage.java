package io.mateu.mdd.demovb.infra.in.ui.island;

import io.mateu.uidl.annotations.Inline;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.Section;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;

/**
 * Host de la isla (Fase 9): una página normal con una sección propia y una EditableView embebida
 * como mediador independiente — alterna lectura/edición por su cuenta sin repintar el host.
 */
@UI("/island-host")
@Title("Island host")
public class IslandHostPage {

  @Section("Estancia")
  String room = "204";

  String status = "Checked-in";

  @Section("Nota del huésped")
  @Label("")
  @Inline
  GuestNoteView guestNote;
}
