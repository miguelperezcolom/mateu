package io.mateu.dtos;

/** Metadata for a html element */
public record ProgressBarDto(
    boolean indeterminate, int min, int max, double value, String text, String theme)
    implements ComponentMetadataDto {}
