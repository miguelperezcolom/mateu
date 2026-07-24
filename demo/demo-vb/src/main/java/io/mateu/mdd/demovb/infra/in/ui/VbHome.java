package io.mateu.mdd.demovb.infra.in.ui;

import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.RouteLink;

/**
 * Shell de la demo VB (Fase 2 del roadmap): app con 2–3 opciones de menú simples. El bridge VB la
 * mapea a la in-app navigation Redwood; el fragmento App configura la shell, no crea contenido.
 *
 * <p>Nota: la ruta de una opción de menú tipada se deriva del NOMBRE DEL CAMPO, así que la de
 * island-host va como {@link RouteLink} explícito (el campo no puede llamarse island-host).
 */
@UI("")
@Title("VB Demo")
public class VbHome {

  @Menu HelloPage hello;

  @Menu PersonForm person;

  @Menu ProductsCrud products;

  @Menu RouteLink islandHost = new RouteLink("/island-host", "Island host");
}
