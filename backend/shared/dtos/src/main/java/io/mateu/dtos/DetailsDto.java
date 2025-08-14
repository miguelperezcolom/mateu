package io.mateu.dtos;

/** Metadata for a html element */
public record DetailsDto(ComponentDto summary, ComponentDto content, boolean opened)
    implements ComponentMetadataDto {}
