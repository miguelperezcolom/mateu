package io.mateu.uidl.data;

public record Banner(
    BannerTheme theme, boolean hasIcon, boolean hasCloseButton, String title, String description) {}
