package io.mateu.demo.signin;

import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.TextContainer;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.security.Principal;

/** Who is signed in, as the server sees the caller (the principal Spring Security authenticated). */
@Title("Home")
public class Home implements ComponentTreeSupplier {

  @Override
  public Component component(HttpRequest httpRequest) {
    Principal principal = httpRequest.getUserPrincipal();
    String who = principal == null ? "nobody (anonymous)" : principal.getName();
    return new VerticalLayout(
        new Text("title", "Signed in with GitHub", TextContainer.h2),
        new Text("who", "You are " + who + "."),
        new Text("how", "Sign out from the button in the header."));
  }
}
