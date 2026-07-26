package io.mateu.mdd.demovb.infra.in.ui.island;

import io.mateu.core.infra.declarative.orchestrators.editableview.AutoEditableView;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.interfaces.HttpRequest;

/**
 * La ISLA (Fase 9): una EditableView independiente embebida en {@link IslandHostPage}. Viaja como
 * ServerSideComponent con id propio — sus fragments llegan con OTRO targetComponentId y el bridge
 * VB debe repintarla sin tocar el host.
 */
@UI("/guest-note")
public class GuestNoteView extends AutoEditableView<GuestNote> {

  /** Almacén mock en memoria (singleton para la demo). */
  private static GuestNote store = new GuestNote("Ada", "Prefiere habitación tranquila");

  @Override
  public GuestNote load(HttpRequest httpRequest) {
    return store;
  }

  @Override
  public void persist(GuestNote entity, HttpRequest httpRequest) {
    store = entity;
  }
}
