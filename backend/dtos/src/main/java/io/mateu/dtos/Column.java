package io.mateu.dtos;

import java.util.Collections;
import java.util.List;

public record Column(
    String id,
    String type,
    String stereotype,
    String caption,
    String description,
    String width,
    boolean readOnly,
    List<Pair> attributes) {

  public Column {
    attributes = Collections.unmodifiableList(attributes);
  }

  @Override
  public List<Pair> attributes() {
    return Collections.unmodifiableList(attributes);
  }
}
