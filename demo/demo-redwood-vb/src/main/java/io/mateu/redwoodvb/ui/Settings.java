package io.mateu.redwoodvb.ui;

import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;

/** Settings content screen. */
@UI("/settings")
@Title("Ajustes")
public class Settings implements ComponentTreeSupplier {
  @Override
  public Component component(HttpRequest httpRequest) {
    return new Text("settings-text", "Ajustes — esta es la pantalla de ajustes.");
  }
}
