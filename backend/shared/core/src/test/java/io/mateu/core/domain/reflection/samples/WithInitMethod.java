package io.mateu.core.domain.reflection.samples;

import io.mateu.uidl.interfaces.HasPostHydrationMethod;
import io.mateu.uidl.interfaces.HttpRequest;

public class WithInitMethod implements HasPostHydrationMethod {

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
