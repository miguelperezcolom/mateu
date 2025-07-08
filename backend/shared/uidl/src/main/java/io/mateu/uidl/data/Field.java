package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import java.util.List;
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
    List<Option> options,
    Object initialValue,
    boolean bindToData,
    String style,
    String cssClasses)
    implements Component {

  public Field {
    stereotype = stereotype != null ? stereotype : FieldStereotype.regular;
  }

  @Override
  public List<Option> options() {
    if (options == null) {
      return List.of();
    }
    return options;
  }
}
