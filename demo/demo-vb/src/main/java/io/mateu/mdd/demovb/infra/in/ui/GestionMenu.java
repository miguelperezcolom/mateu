package io.mateu.mdd.demovb.infra.in.ui;

import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.data.RouteLink;

/** Grupo de menú (Fase 6): una clase con @Menu anidados = submenú en la shell. */
public class GestionMenu {

  @Menu PersonForm person;

  @Menu RouteLink islandHost = new RouteLink("/island-host", "Island host");
}
