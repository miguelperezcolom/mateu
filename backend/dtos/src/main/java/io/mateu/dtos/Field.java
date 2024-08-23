package io.mateu.dtos;

import java.util.Collections;
import java.util.List;

/**
 * A field in a form
 *
 * @param id Field id
 * @param type Field data type
 * @param stereotype Field stereotype (how it is painted)
 * @param observed If a change must trigger a rules reevaluation
 * @param caption The caption/label for this field
 * @param placeholder A placeholder for this field
 * @param cssClasses Css classes to be applied to this field
 * @param description A help text to be used as tooltip
 * @param badges Badges which must appear close to this field
 * @param validations This fields validations
 * @param attributes Some generic attributes
 */
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
