package io.mateu.maven.bundle.fixtures;

import io.mateu.uidl.annotations.UI;

/** A page that cannot even be built: the bundle has to skip it and say why. */
@UI("/broken")
public class BrokenPage {
  public String text = fail();

  private static String fail() {
    throw new IllegalStateException("the database is not reachable at build time");
  }
}
