package io.mateu.redwoodvb.ui;

import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;

/**
 * Fase 1 — "hola mundo". The single node the VB bridge must render inside the real {@code oj-sp}
 * shell: a Page carrying one {@link Text}. Deliberately minimal — the visual gate here is the CHROME
 * (header, RDS strip, backgrounds, footer) being indistinguishable from a native Redwood app, plus
 * this text landing in its place.
 */
@UI("")
@Title("Mateu on Visual Builder")
public class HomePage implements ComponentTreeSupplier {

  @Override
  public Component component(HttpRequest httpRequest) {
    return new Text("greeting", "¡Hola desde Mateu sobre Visual Builder!");
  }
}
