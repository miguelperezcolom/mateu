package io.mateu.uidl.interfaces;

import io.mateu.uidl.fluent.Component;

/**
 * A clickable/navigable item (menu entry, link, button-like element) that can be rendered and
 * dispatched. Exposes its display {@link #label()} and {@link #path()}, the {@link #component()} to
 * show when activated, whether it is currently {@link #selected()} or {@link #disabled()}, and an
 * optional AI-facing {@link #description()}.
 */
public interface Actionable {

  boolean selected();

  String path();

  String label();

  Component component();

  String className();

  boolean disabled();

  boolean disabledOnClick();

  Object itemData();

  /** Optional description for AI assistants. Implementations may return null. */
  default String description() {
    return null;
  }
}
