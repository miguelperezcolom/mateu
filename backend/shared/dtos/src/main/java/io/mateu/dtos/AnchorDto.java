package io.mateu.dtos;

/** Metadata for a html element */
public record AnchorDto(String text, String url) implements ComponentMetadataDto {}
