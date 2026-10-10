package io.mateu.uidl.data;

/**
 * How a menu entry looks, beyond its label: the {@code display} of a group ({@link
 * MenuDisplay#cards} opens a card panel), and the {@code icon} / {@code image} of an entry shown as
 * a card. Declared with {@code @Menu(display, image)} and {@code @Icon} on the {@code @Menu} field,
 * or set fluently with {@code withPresentation}. Null = the plain list entry.
 */
public record MenuPresentation(MenuDisplay display, String icon, String image) {

  public static MenuPresentation cards() {
    return new MenuPresentation(MenuDisplay.cards, null, null);
  }

  public static MenuPresentation card(String icon, String image) {
    return new MenuPresentation(null, icon, image);
  }

  public boolean showsCards() {
    return display == MenuDisplay.cards;
  }
}
