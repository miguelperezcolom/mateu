package io.mateu.maven.bundle.fixtures;

import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;

/** A page whose button runs a server-side method: it cannot work from a static bundle. */
@UI("/orders")
@Title("Server page")
public class ServerPage {
  public String customer = "Acme";

  @Button
  public void approve() {}
}
