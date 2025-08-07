package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.Actionable;
import lombok.Builder;

@Builder
public record MenuSeparator() implements Actionable {

  @Override
  public boolean selected() {
    return false;
  }

  @Override
  public String path() {
    return "";
  }

  @Override
  public String label() {
    return "";
  }

  public Component component() {
    return null;
  }

  @Override
  public String className() {
    return "";
  }

  @Override
  public boolean disabled() {
    return false;
  }

  @Override
  public boolean disabledOnClick() {
    return false;
  }

  @Override
  public Object itemData() {
    return null;
  }
}
