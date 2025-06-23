package io.mateu.dtos;

/** Metadata for a html element */
public record TooltipDto(String text, ComponentDto wrapped) implements ComponentMetadataDto {}
