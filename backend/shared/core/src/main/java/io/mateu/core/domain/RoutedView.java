package io.mateu.core.domain;

import io.mateu.uidl.interfaces.HttpRequest;

/**
 * The view model a request is addressed to (what its route resolved to), as opposed to the views
 * nested in it — e.g. so only the routed page of a tree-building view gets the page toolbar.
 */
public final class RoutedView {

  /** The request attribute holding it. */
  public static final String ATTRIBUTE = "_mateuRoutedView";

  private RoutedView() {}

  public static void set(Object view, HttpRequest httpRequest) {
    if (view != null && httpRequest != null) {
      httpRequest.setAttribute(ATTRIBUTE, view);
    }
  }

  /** Whether {@code view} is the one this request is addressed to. */
  public static boolean is(Object view, HttpRequest httpRequest) {
    return view != null && httpRequest != null && httpRequest.getAttribute(ATTRIBUTE) == view;
  }
}
