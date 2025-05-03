package com.example.uis;

import io.mateu.uidl.annotations.MateuUI;
import io.mateu.uidl.interfaces.HasPageTitle;

@MateuUI("/holamundo")
public record HolaMundo(String title) implements HasPageTitle {
  @Override
  public String getPageTitle() {
    return "Hola, que tal?";
  }
}
