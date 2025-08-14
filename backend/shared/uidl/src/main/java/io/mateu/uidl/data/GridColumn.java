package io.mateu.uidl.data;

import lombok.Builder;

@Builder
public record GridColumn(
    String id,
    String label,
    FieldDataType dataType,
    FieldStereotype stereotype,
    String style,
    String cssClasses,
    boolean sortable,
    String sortingProperty,
    boolean filterable,
    boolean frozen,
    boolean frozenToEnd,
    boolean autoWidth,
    String flexGrow,
    boolean resizable,
    String width)
    implements GridContent {

  public FieldDataType dataType() {
    return dataType != null ? dataType : FieldDataType.string;
  }

  public FieldStereotype stereotype() {
    return stereotype != null ? stereotype : FieldStereotype.regular;
  }
}
