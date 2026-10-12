package io.mateu.dtos;

/** The app shell variant on the wire. */
public enum AppVariantDto {
  /**
   * The wire spelling servers sent up to 3.0-alpha.411. Servers now send {@link #HAMBURGER_MENU};
   * renderers accept both spellings, so a payload from an older server still renders.
   *
   * @deprecated use {@link #HAMBURGER_MENU} instead.
   */
  @Deprecated(since = "3.0-alpha.412", forRemoval = true)
  HAMBURGUER_MENU,
  /** A hamburger button opening the whole menu in a drawer (sent since 3.0-alpha.412). */
  HAMBURGER_MENU,
  HAMBURGER_SECTIONS,
  MENU_ON_LEFT,
  MENU_ON_TOP,
  TABS,
  TILES,
  RAIL,
  AUTO,
  MEDIATOR
}
