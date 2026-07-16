package io.mateu.dtos;

/**
 * A compact inline banner: theme-tinted strip with a severity icon, one line of text and an
 * optional right-aligned action.
 */
public record NoticeDto(
    String text,
    String theme,
    String icon,
    boolean noIcon,
    String actionLabel,
    String actionId,
    String status,
    boolean slim,
    boolean fullWidth)
    implements ComponentMetadataDto {}
