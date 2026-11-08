package io.mateu.uidl.fluent;

public enum AppVariant {
  /**
   * A hamburger button opening the whole menu in a drawer. It is also the wire value (since
   * 3.0-alpha.412; the old misspelling {@code HAMBURGUER_MENU} was removed in 3.0.0 — renderers
   * still accept it on the wire).
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
