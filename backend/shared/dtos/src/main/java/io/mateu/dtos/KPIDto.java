package io.mateu.dtos;

/** A badge */
public record KPIDto(String title, String text, String style, String cssClasses)
    implements ComponentMetadataDto {}
