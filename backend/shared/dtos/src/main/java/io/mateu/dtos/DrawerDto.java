package io.mateu.dtos;

import lombok.Builder;

/** Metadata for a side panel sliding in from an edge of the viewport */
@Builder
public record DrawerDto(
    String id,
    String headerTitle,
    ComponentDto header,
    ComponentDto content,
    ComponentDto footer,
    DrawerPositionDto position,
    String width,
    boolean noPadding,
    boolean modeless,
    Object initialData)
    implements ComponentMetadataDto {}
