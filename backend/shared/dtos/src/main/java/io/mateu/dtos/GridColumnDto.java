package io.mateu.dtos;

import lombok.Builder;

/** Metadata for a html element */
@Builder
public record GridColumnDto(
    String id,
    String label,
    String dataType,
    String stereotype,
    String style,
    String cssClasses,
    String align,
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
    java.util.List<OptionDto> editorOptions,
    Double weight,
    String aggregate,
    /* 1-based line of the row (multi-line rows, @Line); null = line 1 */
    Integer line,
    /* a status column's badge tone per value (success | warning | danger | info | neutral) */
    java.util.Map<String, String> tones)
    implements ComponentMetadataDto {}
