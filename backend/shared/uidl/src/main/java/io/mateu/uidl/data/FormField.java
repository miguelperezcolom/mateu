package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import java.util.List;
import lombok.Builder;

@Builder
public record FormField(
    String id,
    String label,
    FieldDataType dataType,
    FieldStereotype stereotype,
    boolean required,
    boolean autofocus,
    String placeholder,
    String description,
    List<Option> options,
    Object initialValue,
    String style,
    String cssClasses)
    implements Component {

  public FormField {
    stereotype = stereotype != null ? stereotype : FieldStereotype.regular;
  }

  @Override
  public List<Option> options() {
    return options != null ? options : List.of();
  }
}
