package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.fluent.Form;
import java.util.List;
import lombok.Builder;

@Builder
public record FormField(
    String id,
    String label,
    FieldDataType dataType,
    FieldStereotype stereotype,
    boolean readOnly,
    boolean required,
    boolean autofocus,
    String placeholder,
    String description,
    List<Option> options,
    RemoteCoordinates remoteCoordinates,
    Object initialValue,
    String style,
    String cssClasses,
    List<GridContent> columns,
    Form createForm,
    Form editor,
    String onItemSelectionActionId,
    int colspan,
    FormPosition formPosition,
    int sliderMin,
    int sliderMax,
    boolean stepButtonsVisible,
    double step,
    String itemIdPath)
    implements Component {

  public FormField {
    stereotype = stereotype != null ? stereotype : FieldStereotype.regular;
  }

  @Override
  public List<Option> options() {
    return options != null ? options : List.of();
  }

  public List<GridContent> columns() {
    return columns != null ? columns : List.of();
  }
}
