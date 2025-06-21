package io.mateu.dtos;

/** A badge */
public record BadgeDto(
    String text,
    String iconOnLeft,
    String iconOnRight,
    BadgeColorDto color,
    boolean primary,
    boolean small,
    boolean pill)
    implements ComponentMetadataDto {}
