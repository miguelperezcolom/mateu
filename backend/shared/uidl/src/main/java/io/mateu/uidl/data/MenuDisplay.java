package io.mateu.uidl.data;

import io.mateu.uidl.annotations.Experimental;

/**
 * How a menu GROUP shows its entries when it opens: as the usual list, or as a panel of CARDS —
 * title, description, an icon or image, and the entry's own children as actions — like the product
 * menus of a documentation site.
 */
@Experimental("card menus (3.0-alpha.409)")
public enum MenuDisplay {
  list,
  cards
}
