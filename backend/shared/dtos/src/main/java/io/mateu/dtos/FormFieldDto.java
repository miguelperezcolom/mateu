package io.mateu.dtos;

import java.util.Collections;
import java.util.List;
import lombok.Builder;

/**
 * A field in a form
 *
 * @param fieldId Field targetId
 * @param dataType Field data dataType
 * @param stereotype Field stereotype (how it is painted)
 * @param observed If a change must trigger a rules reevaluation
 * @param wantsFocus Set to true if you want it to be focused when rendered
 * @param label The label/label for this field
 * @param placeholder A placeholder for this field
 * @param cssClasses Css cssClasses to be applied to this field
 * @param description A help text to be used as tooltip
 * @param badges Badges which must appear close to this field
 * @param validations This fields validations
 * @param attributes Some generic attributes
 * @param colspan Colspan for this field
 */
@Builder
public record FormFieldDto(
    String fieldId,
    String dataType,
    String stereotype,
    boolean observed,
    boolean wantsFocus,
    String label,
    String placeholder,
    String cssClasses,
    String description,
    List<BadgeDto> badges,
    List<ValidationDto> validations,
    List<PairDto> attributes,
    int colspan,
    boolean rightAligned,
    boolean bold)
    implements ComponentMetadataDto {

  public FormFieldDto {
    badges =
        Collections.unmodifiableList(badges != null ? badges : Collections.<BadgeDto>emptyList());
    validations =
        Collections.unmodifiableList(
            validations != null ? validations : Collections.<ValidationDto>emptyList());
    attributes =
        Collections.unmodifiableList(
            attributes != null ? attributes : Collections.<PairDto>emptyList());
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
