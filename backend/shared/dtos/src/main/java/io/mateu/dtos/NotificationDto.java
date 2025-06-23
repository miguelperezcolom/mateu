package io.mateu.dtos;

/** Metadata for a html element */
public record NotificationDto(String title, String text) implements ComponentMetadataDto {}
