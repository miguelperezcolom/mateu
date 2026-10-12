package com.example.app;

import io.mateu.core.infra.declarative.orchestrators.welcome.Welcome;
import io.mateu.uidl.annotations.Panel;
import io.mateu.uidl.data.Text;

/**
 * The home page, a {@link Welcome}: a hero with a title and an intro, and {@code @Panel} fields as
 * tiles below it ({@code Button} fields would become its calls to action). Reached through its menu
 * entry in {@link Shell}, which also makes it the page the app opens on.
 */
public class Home extends Welcome {

  @Panel(title = "Your first screen")
  Text next =
      new Text(
          "Write a class for it (a form, an AutoCrud, a dashboard…) and add a @Menu field of that"
              + " class to Shell.");

  @Override
  protected String heroTitle() {
    return "My app";
  }

  @Override
  protected String heroSubtitle() {
    return "Every screen here is declared in Java; Mateu renders it.";
  }
}
