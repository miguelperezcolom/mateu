package io.mateu.dtos;

import java.util.Collections;
import java.util.List;

public record Card(
    String title,
    String subtitle,
    String info,
    String icon,
    String total,
    List<FieldGroup> fieldGroups)
    implements ViewMetadata {

  public Card {
    fieldGroups = Collections.unmodifiableList(fieldGroups);
  }

  @Override
  public List<FieldGroup> fieldGroups() {
    return Collections.unmodifiableList(fieldGroups);
  }
}
