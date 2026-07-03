package io.mateu.uidl.interfaces;

/**
 * Supplies a view's in-page title (heading) at runtime. Implement {@link #title()} to compute it
 * dynamically instead of using a static {@code @Title} annotation or the class name; see {@link
 * PageTitleSupplier} for the browser/document title.
 */
public interface TitleSupplier {

  String title();
}
