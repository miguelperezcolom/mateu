package io.mateu.uidl.interfaces;

/**
 * Supplies a view's overline (the small line of text shown above the title) at runtime. Implement
 * {@link #overline()} to compute it dynamically instead of using a static {@code @Overline}
 * annotation; the supplier wins when both are present.
 */
public interface OverlineSupplier {

  String overline();
}
