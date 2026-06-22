package io.mateu.uidl.data;

public record PageBanner(
    BannerTheme theme, String title, String description, boolean closeable, int timeoutSeconds) {

  public PageBanner(BannerTheme theme, String title, String description) {
    this(theme, title, description, false, 0);
  }
}
