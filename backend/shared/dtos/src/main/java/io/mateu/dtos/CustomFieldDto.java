package io.mateu.dtos;

/** Metadata for a html element */
public record CustomFieldDto(String label, ComponentDto content, int colspan)
    implements ComponentMetadataDto {}
