package io.mateu.dtos;

/** Metadata for a html element */
public record DialogDto(String title, ComponentDto content) implements ComponentMetadataDto {}
