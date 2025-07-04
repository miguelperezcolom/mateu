package io.mateu.dtos;

import java.util.List;

/** Metadata for a html element */
public record ContextMenuDto(List<MenuOptionDto> menu, ComponentDto wrapped)
    implements ComponentMetadataDto {}
