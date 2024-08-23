package io.mateu.dtos;

import java.util.Collections;
import java.util.List;

/**
 * A section inside a form. Forms contain sections which contain field groups
 * which contain field lines which contain fields
 *
 * @param id Section id
 * @param tabId Tab id in case we want this section to be shown inside a tab
 * @param caption Section title
 * @param description Section description. A kind of subtitle
 * @param readOnly If all the fields in this section should be read only
 * @param type Section type: card (if we want a border around) or transparent
 * @param leftSideImageUrl Image to show on the left side of this section
 * @param topImageUrl Image to show at the stop of this section
 * @param fieldGroups Groups of fields which belong to this section
 */
public record Section(
    String id,
    String tabId,
    String caption,
    String description,
    boolean readOnly,
    SectionType type,
    String leftSideImageUrl,
    String topImageUrl,
    List<FieldGroup> fieldGroups) {

  public Section {
    fieldGroups = Collections.unmodifiableList(fieldGroups);
  }

  @Override
  public List<FieldGroup> fieldGroups() {
    return Collections.unmodifiableList(fieldGroups);
  }
}
