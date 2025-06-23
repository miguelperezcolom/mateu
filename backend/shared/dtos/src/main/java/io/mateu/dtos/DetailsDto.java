package io.mateu.dtos;

/** Metadata for a html element */
public record DetailsDto(String title, ComponentDto content) implements ComponentMetadataDto {}
