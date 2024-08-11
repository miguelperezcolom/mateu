package io.mateu.dtos;

import java.util.Collections;
import java.util.List;

public record ViewPart(String classes, List<Component> components) {

  public ViewPart {
    components = Collections.unmodifiableList(components);
  }

  @Override
  public List<Component> components() {
    return Collections.unmodifiableList(components);
  }
}
