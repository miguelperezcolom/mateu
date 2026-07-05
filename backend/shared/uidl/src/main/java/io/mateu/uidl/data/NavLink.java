package io.mateu.uidl.data;

import lombok.Builder;

/**
 * Navigation link rendered as an icon at the right side of a form field (see {@code @LinkTo} and
 * {@link io.mateu.uidl.interfaces.LinkSupplier}).
 *
 * @param href destination URL or route; supports {@code ${...}} state interpolation
 * @param icon icon to render; the renderer picks a sensible default when empty
 * @param title tooltip for the icon; supports {@code ${...}} state interpolation
 * @param target link target, e.g. {@code _blank} to open in a new tab
 */
@Builder(toBuilder = true)
public record NavLink(String href, String icon, String title, String target) {

  public static NavLink to(String href) {
    return NavLink.builder().href(href).build();
  }
}
