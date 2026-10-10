package io.mateu.uidl.fluent;

public enum AppVariant {
  /**
   * The misspelling of {@link #HAMBURGER_MENU}, kept so existing declarations (Java and YAML) keep
   * compiling and parsing. Both render the same; on the wire the variant still travels as {@code
   * HAMBURGUER_MENU}, which every renderer reads (they accept both spellings).
   *
   * @deprecated use {@link #HAMBURGER_MENU} instead.
   */
  @Deprecated(since = "3.0-alpha.410", forRemoval = true)
  HAMBURGUER_MENU,
  /**
   * A hamburger button opening the whole menu in a drawer. The right spelling of the deprecated
   * {@code HAMBURGUER_MENU}: the server sends it to the renderers under the old wire name, so
   * either can be declared.
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
