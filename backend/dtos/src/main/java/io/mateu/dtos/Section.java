package io.mateu.dtos;

import java.util.Collections;
import java.util.List;

public record Section(
    String id,
    String tabId,
    String caption,
    String description,
    boolean readOnly,
    SectionType type,
    String leftSideImageUrl,
    String topImageUrl,
    List<Action> actions,
    List<FieldGroup> fieldGroups) {

  public Section {
    actions = Collections.unmodifiableList(actions);
    fieldGroups = Collections.unmodifiableList(fieldGroups);
  }

  @Override
  public List<Action> actions() {
    return Collections.unmodifiableList(actions);
  }

  @Override
  public List<FieldGroup> fieldGroups() {
    return Collections.unmodifiableList(fieldGroups);
  }
}
