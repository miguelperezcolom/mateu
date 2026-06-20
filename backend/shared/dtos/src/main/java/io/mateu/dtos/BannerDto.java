package io.mateu.dtos;

/**
 * A banner. Similar to message, but with a different behaviour
 *
 * @param theme The banner theme: success, error, info, ...
 * @param hasIcon The banner icon
 * @param hasCloseButton If this banner is closeable
 * @param title The banner title
 * @param description The banner text
 * @param timeoutSeconds Auto-dismiss after this many seconds (0 = no auto-dismiss)
 */
public record BannerDto(
    BannerThemeDto theme,
    boolean hasIcon,
    boolean hasCloseButton,
    String title,
    String description,
    int timeoutSeconds) {}
