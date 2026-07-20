package io.mateu.uidl.data;

/**
 * Standard {@link Drawer} widths, following the Oracle Redwood drawer sizes: {@code s} = 464px,
 * {@code m} = 648px, {@code l} = 968px, {@code xl} = 90% of the viewport. An explicit {@code
 * Drawer.width} overrides the size. The {@code maximize} action bumps the drawer to the next size
 * up (s→m→l→xl).
 */
public enum DrawerSize {
  s,
  m,
  l,
  xl
}
