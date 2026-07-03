package io.mateu.uidl.interfaces;

/**
 * Supplies the browser/document page title (the tab/window title) for a view. Implement {@link
 * #pageTitle()} to compute it dynamically; distinct from {@link TitleSupplier}, which supplies the
 * in-page heading.
 */
public interface PageTitleSupplier {

  String pageTitle();
}
