package io.mateu.uidl.data;

import java.util.List;
import lombok.Builder;

@Builder(toBuilder = true)
public record GridColumn(
    String id,
    String label,
    FieldDataType dataType,
    FieldStereotype stereotype,
    String style,
    String cssClasses,
    ColumnAlignment align,
    boolean sortable,
    String sortingProperty,
    boolean filterable,
    boolean frozen,
    boolean frozenToEnd,
    boolean autoWidth,
    String flexGrow,
    boolean resizable,
    String width,
    String tooltipPath,
    String actionId,
    String text,
    Integer priority,
    boolean identifier,
    boolean editable,
    String editorType,
    List<Option> editorOptions,
    Double weight)
    implements GridContent {

  public FieldDataType dataType() {
    return dataType != null ? dataType : FieldDataType.string;
  }

  public FieldStereotype stereotype() {
    return stereotype != null ? stereotype : FieldStereotype.regular;
  }

  /**
   * Returns the layout priority; lower value = higher importance. Defaults to Integer.MAX_VALUE.
   */
  public Integer priority() {
    return priority != null ? priority : Integer.MAX_VALUE;
  }
}
