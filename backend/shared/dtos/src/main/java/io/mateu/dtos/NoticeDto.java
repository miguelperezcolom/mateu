package io.mateu.dtos;

/**
 * A compact inline banner: theme-tinted strip with a severity icon, one line of text and an
 * optional right-aligned action.
 */
public record NoticeDto(
    String text,
    String theme,
    String icon,
    String actionLabel,
    String actionId,
    boolean slim,
    boolean fullWidth)
    implements ComponentMetadataDto {}
