package io.mateu.uidl.data;

public record PageBadge(String text, String color, boolean primary, boolean small, boolean pill) {

  public PageBadge(String text, String color) {
    this(text, color, false, true, true);
  }

  public PageBadge(String text) {
    this(text, BadgeColor.normal.name());
  }
}
