package io.mateu.dtos;

/**
 * A badge
 *
 * @param theme Theme to be used: info, warning, success, ...
 * @param message The message text to be shown
 * @param icon The icon to be shown
 * @param badgeStyle The badge style: round, square
 * @param iconPosition The icon position: left or right
 */
public record Badge(
        BadgeTheme theme,
        String message,
        String icon,
        BadgeStyle badgeStyle,
        BadgeIconPosition iconPosition
) {

}
