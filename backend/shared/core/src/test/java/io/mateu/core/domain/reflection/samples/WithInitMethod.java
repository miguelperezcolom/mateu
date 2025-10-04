package io.mateu.core.domain.reflection.samples;

import io.mateu.uidl.interfaces.PostHydrationHandler;
import io.mateu.uidl.interfaces.HttpRequest;

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
