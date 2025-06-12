package io.mateu.uidl.data;

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
}
