package io.mateu.dtos;

/** Metadata for a html element */
public record ProgressBarDto(
    boolean indeterminate,
    int min,
    int max,
    double value,
    String valueKey,
    String text,
    String theme)
    implements ComponentMetadataDto {}
