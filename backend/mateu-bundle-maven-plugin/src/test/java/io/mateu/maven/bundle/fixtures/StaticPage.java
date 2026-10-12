package io.mateu.maven.bundle.fixtures;

import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;

/** A page a static bundle can serve with no backend: no action needs the server. */
@UI("/about")
@Title("Static page")
public class StaticPage {
  public String text = "Read-only content";
}
