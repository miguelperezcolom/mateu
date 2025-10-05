package io.mateu.core.domain.reflection.samples;

import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.PostHydrationHandler;

public class WithInitMethod implements PostHydrationHandler {

  public String name;

  @Override
  public void onHydrated(HttpRequest httpRequest) {
    name = "Mateu";
  }

  @Override
  public String toString() {
    return name;
  }
}
