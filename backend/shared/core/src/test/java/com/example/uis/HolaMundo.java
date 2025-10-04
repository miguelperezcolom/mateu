package com.example.uis;

import io.mateu.uidl.annotations.MateuUI;
import io.mateu.uidl.interfaces.PageTitleSupplier;

@MateuUI("/holamundo")
public record HolaMundo(String title) implements PageTitleSupplier {
  @Override
  public String pageTitle() {
    return "Hola, que tal?";
  }
}
