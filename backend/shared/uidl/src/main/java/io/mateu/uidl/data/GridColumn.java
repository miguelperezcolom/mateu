package io.mateu.uidl.data;

import io.mateu.uidl.annotations.Experimental;
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
    // Rich "primary" column (coherence-plan #6): the row field to read for the secondary caption
    // line, and the one for the leading avatar/icon. Both null unless stereotype == primary.
    String captionPath,
    String leadingPath,
    Integer priority,
    boolean identifier,
    boolean editable,
    String editorType,
    List<Option> editorOptions,
    Double weight,
    String aggregate,
    // Multi-line rows (@Line): the 1-based line of the row this column is drawn on; null/1 = the
    // ordinary columns. A listing with any column on line > 1 draws each row on several lines.
    Integer line,
    // A status column's badge tone per VALUE (OPEN -> warning): success | warning | danger | info |
    // neutral, like @RowStatus. Usually supplied by a field type (types.yaml). Null = none, every
    // value reads by its word as before.
    @Experimental("value tones, usually from a field type (types.yaml)")
        java.util.Map<String, String> tones)
    implements GridContent {

  /** The shape before {@code tones} (released in v3.0-alpha.408): no value tones. */
  public GridColumn(
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
      String captionPath,
      String leadingPath,
      Integer priority,
      boolean identifier,
      boolean editable,
      String editorType,
      List<Option> editorOptions,
      Double weight,
      String aggregate,
      Integer line) {
    this(
        id,
        label,
        dataType,
        stereotype,
        style,
        cssClasses,
        align,
        sortable,
        sortingProperty,
        filterable,
        frozen,
        frozenToEnd,
        autoWidth,
        flexGrow,
        resizable,
        width,
        tooltipPath,
        actionId,
        text,
        captionPath,
        leadingPath,
        priority,
        identifier,
        editable,
        editorType,
        editorOptions,
        weight,
        aggregate,
        line,
        null);
  }

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

  /** The 1-based line of the row this column is drawn on; defaults to 1. */
  public Integer line() {
    return line != null && line > 1 ? line : 1;
  }
}
