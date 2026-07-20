package io.mateu.uidl.data;

/**
 * Lateral navigation across peer objects, shown as previous/next arrows in the page header (the
 * Oracle Redwood "next/previous object" header element). Each side carries a {@code label} (shown
 * as the arrow's tooltip) and a {@code route} to navigate to; a {@code null} route disables that
 * arrow. Supplied programmatically by a page implementing {@link
 * io.mateu.uidl.interfaces.PeerNavigationSupplier}.
 */
public record PeerNav(String prevLabel, String prevRoute, String nextLabel, String nextRoute) {

  public static PeerNav of(String prevRoute, String nextRoute) {
    return new PeerNav(null, prevRoute, null, nextRoute);
  }
}
