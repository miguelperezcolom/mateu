package io.mateu.redwoodvb.ui;

import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;

/** Home content screen. */
@UI("/home")
@Title("Inicio")
public class Home implements ComponentTreeSupplier {
  @Override
  public Component component(HttpRequest httpRequest) {
    return new Text("home-greeting", "Inicio — ¡Hola desde Mateu sobre Visual Builder!");
  }
}
