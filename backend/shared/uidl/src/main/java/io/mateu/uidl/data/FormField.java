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
    boolean bindToData,
    String style,
    String cssClasses,
    List<FieldValidation> validations)
    implements Component {

  public FormField {
    stereotype = stereotype != null ? stereotype : FieldStereotype.regular;
  }

  @Override
  public List<FieldValidation> validations() {
    return validations != null ? validations : List.of();
  }

  @Override
  public List<Option> options() {
    return options != null ? options : List.of();
  }
}
