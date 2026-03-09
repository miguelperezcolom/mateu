package com.example.uis;

import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.interfaces.PageTitleSupplier;

@UI("/holamundo")
public record HolaMundo(String title) implements PageTitleSupplier {
  @Override
  public String pageTitle() {
    return "Hola, que tal?";
  }
}
