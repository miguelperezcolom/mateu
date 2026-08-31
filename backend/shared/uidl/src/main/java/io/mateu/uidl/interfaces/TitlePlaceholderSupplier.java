package io.mateu.uidl.interfaces;

/**
 * Supplies a view's title placeholder (what the header shows while the title is still empty) at
 * runtime. Implement {@link #titlePlaceholder()} to compute it dynamically instead of using a
 * static {@code @TitlePlaceholder} annotation; the supplier wins when both are present.
 */
public interface TitlePlaceholderSupplier {

  String titlePlaceholder();
}
