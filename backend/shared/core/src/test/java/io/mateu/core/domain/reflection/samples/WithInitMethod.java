package io.mateu.core.domain.reflection.samples;

import io.mateu.uidl.interfaces.HasInitMethod;
import io.mateu.uidl.interfaces.HttpRequest;

public class WithInitMethod implements HasInitMethod {

  public String name;

  @Override
  public void init(HttpRequest httpRequest) {
    name = "Mateu";
  }

  @Override
  public String toString() {
    return name;
  }
}
