package io.mateu.uidl.interfaces;

import java.util.List;

/**
 * Supplies the navigation menu entries for an app shell dynamically at runtime. Implement {@link
 * #menu(HttpRequest)} to return the ordered list of {@link Actionable} menu items (which may depend
 * on the current request/user), instead of, or in addition to, statically declared menus.
 */
public interface MenuSupplier {

  List<Actionable> menu(HttpRequest httpRequest);
}
