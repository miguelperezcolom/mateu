package io.mateu.dtos;

import java.util.Collections;
import java.util.List;

public record Field(
    String id,
    String type,
    String stereotype,
    boolean observed,
    String caption,
    String placeholder,
    String cssClasses,
    String description,
    List<Badge> badges,
    List<Validation> validations,
    List<Pair> attributes) {

  public Field {
    badges = Collections.unmodifiableList(badges);
    validations = Collections.unmodifiableList(validations);
    attributes = Collections.unmodifiableList(attributes);
  }

  @Override
  public List<Badge> badges() {
    return Collections.unmodifiableList(badges);
  }

  @Override
  public List<Validation> validations() {
    return Collections.unmodifiableList(validations);
  }

  @Override
  public List<Pair> attributes() {
    return Collections.unmodifiableList(attributes);
  }
}
