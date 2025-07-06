package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import lombok.Builder;

@Builder
public record Column(
    String id, String label, FieldDataType dataType, FieldStereotype stereotype, String cssClasses)
    implements Component {

  public FieldDataType dataType() {
    return dataType != null ? dataType : FieldDataType.string;
  }

  public FieldStereotype stereotype() {
    return stereotype != null ? stereotype : FieldStereotype.regular;
  }
}
