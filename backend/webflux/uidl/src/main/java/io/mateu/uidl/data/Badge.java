package io.mateu.uidl.data;

public record Badge(
    BadgeTheme theme,
    String label,
    String icon,
    BadgeStyle badgeStyle,
    BadgeIconPosition iconPosition) {

  public Badge(BadgeTheme theme, String label) {
    this(theme, label, "", null, null);
  }
}
