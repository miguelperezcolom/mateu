package io.mateu.dtos;

import java.util.Collections;
import java.util.List;

/**
 * A field in a form
 *
 * @param id Field targetId
 * @param type Field data type
 * @param stereotype Field stereotype (how it is painted)
 * @param observed If a change must trigger a rules reevaluation
 * @param wantsFocus Set to true if you want it to be focused when rendered
 * @param caption The label/label for this field
 * @param placeholder A placeholder for this field
 * @param cssClasses Css cssClasses to be applied to this field
 * @param description A help text to be used as tooltip
 * @param badges Badges which must appear close to this field
 * @param validations This fields validations
 * @param attributes Some generic attributes
 * @param colspan Colspan for this field
 */
public record FieldDto(
    String id,
    String type,
    String stereotype,
    boolean observed,
    boolean wantsFocus,
    String caption,
    String placeholder,
    String cssClasses,
    String description,
    List<BadgeDto> badges,
    List<ValidationDto> validations,
    List<PairDto> attributes,
    int colspan,
    boolean rightAligned,
    boolean bold) {

  public FieldDto {
    badges = Collections.unmodifiableList(badges);
    validations = Collections.unmodifiableList(validations);
    attributes = Collections.unmodifiableList(attributes);
  }

  @Override
  public List<BadgeDto> badges() {
    return Collections.unmodifiableList(badges);
  }

  @Override
  public List<ValidationDto> validations() {
    return Collections.unmodifiableList(validations);
  }

  @Override
  public List<PairDto> attributes() {
    return Collections.unmodifiableList(attributes);
  }
}
