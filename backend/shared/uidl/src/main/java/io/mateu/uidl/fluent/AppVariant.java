package io.mateu.uidl.fluent;

public enum AppVariant {
  HAMBURGUER_MENU,
  /**
   * The right spelling of {@link #HAMBURGUER_MENU}, the same presentation: the server sends it to
   * the renderers under the old name, so either can be declared.
   */
  HAMBURGER_MENU,
  /**
   * Opera Cloud style: the hamburger holds the sections (the menu's first level) and the band under
   * the header the entries of the section on screen (the second level; a group of them is a
   * dropdown). Choosing a section goes to its first entry. {@link #AUTO} never picks it.
   */
  HAMBURGER_SECTIONS,
  MENU_ON_LEFT,
  MENU_ON_TOP,
  TABS,
  TILES,
  RAIL,
  AUTO,
  MEDIATOR
}
