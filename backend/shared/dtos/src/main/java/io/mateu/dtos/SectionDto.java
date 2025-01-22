package io.mateu.dtos;

import java.util.Collections;
import java.util.List;

/**
 * A section inside a form. Forms contain sections which contain field groups which contain field
 * lines which contain fields
 *
 * @param id Section targetId
 * @param tabId Tab targetId in case we want this section to be shown inside a tab
 * @param caption Section title
 * @param description Section description. A kind of subtitle
 * @param readOnly If all the fields in this section should be read only
 * @param type Section type: card (if we want a border around) or transparent
 * @param leftSideImageUrl Image to show on the left side of this section
 * @param topImageUrl Image to show at the stop of this section
 * @param fieldGroups Groups of fields which belong to this section
 * @param columns Number of columns in this section
 */
public record SectionDto(
    String id,
    String tabId,
    String caption,
    String description,
    boolean readOnly,
    SectionTypeDto type,
    String leftSideImageUrl,
    String topImageUrl,
    List<FieldGroupDto> fieldGroups,
    int columns,
    boolean sidePositionedLabel,
    String itemLabelWidth) {

  public SectionDto {
    fieldGroups = Collections.unmodifiableList(fieldGroups);
  }

  @Override
  public List<FieldGroupDto> fieldGroups() {
    return Collections.unmodifiableList(fieldGroups);
  }
}
