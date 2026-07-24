package io.mateu.redwoodvb.ui;

import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;

/** Reports content screen. */
@UI("/reports")
@Title("Informes")
public class Reports implements ComponentTreeSupplier {
  @Override
  public Component component(HttpRequest httpRequest) {
    return new Text("reports-text", "Informes — esta es la pantalla de informes.");
  }
}
