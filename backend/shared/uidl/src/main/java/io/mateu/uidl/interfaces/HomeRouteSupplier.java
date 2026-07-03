package io.mateu.uidl.interfaces;

/**
 * Implemented by an app shell to declare its landing route programmatically. {@link #homeRoute()}
 * returns the path to redirect to when the app is opened at its root.
 */
public interface HomeRouteSupplier {

  String homeRoute();
}
