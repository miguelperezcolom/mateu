package io.mateu.dtos;

/** Metadata for a html element */
public record PopoverDto(ComponentDto content, ComponentDto wrapped)
    implements ComponentMetadataDto {}
