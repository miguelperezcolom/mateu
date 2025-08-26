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
    String width)
    implements ComponentMetadataDto {}
