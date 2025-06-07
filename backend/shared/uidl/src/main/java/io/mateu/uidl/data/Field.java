package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import lombok.Builder;

@Builder
public record Field(
    String id,
    String label,
    FieldDataType dataType,
    FieldStereotype stereotype,
    boolean required,
    String placeholder,
    String description,
    String cssClasses)
    implements Component {

  public Field {
    stereotype = stereotype != null ? stereotype : FieldStereotype.regular;
  }
}
