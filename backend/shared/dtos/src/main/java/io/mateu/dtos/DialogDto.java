package io.mateu.dtos;

import lombok.Builder;

/** Metadata for a html element */
@Builder
public record DialogDto(
    String headerTitle,
    ComponentDto header,
    ComponentDto content,
    ComponentDto footer,
    boolean noPadding,
    boolean modeless,
    String top,
    String left,
    boolean draggable,
    String width,
    String height,
    boolean resizable,
    boolean closeButtonOnHeader)
    implements ComponentMetadataDto {}
