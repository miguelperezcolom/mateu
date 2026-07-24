package io.mateu.mdd.demovb.infra.in.ui;

import io.mateu.mdd.demovb.infra.in.ui.island.IslandHostPage;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;

/**
 * Shell de la demo VB (Fase 2 del roadmap): app con 2–3 opciones de menú simples. El bridge VB la
 * mapea a {@code oj-sp-navigator}; el fragmento App configura la shell, no crea contenido.
 */
@UI("")
@Title("VB Demo")
public class VbHome {

  @Menu HelloPage hello;

  @Menu PersonForm person;

  @Menu ProductsCrud products;

  @Menu IslandHostPage islandHost;
}
