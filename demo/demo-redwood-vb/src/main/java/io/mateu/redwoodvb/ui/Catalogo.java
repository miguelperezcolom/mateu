package io.mateu.redwoodvb.ui;

import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.interfaces.Submenu;

/** Fase 6 — a submenu group: Products + Contacts nested under "Catálogo". */
public class Catalogo implements Submenu {
  @Menu Products products;
  @Menu Contacts contacts;
}
