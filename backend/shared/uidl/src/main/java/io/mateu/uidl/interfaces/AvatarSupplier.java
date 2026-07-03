package io.mateu.uidl.interfaces;

import io.mateu.uidl.fluent.Component;

/**
 * Implemented by an app shell to supply the avatar component shown in the header (e.g. the
 * logged-in user's picture or initials). {@link #avatar()} returns the fluent {@link Component} to
 * render.
 */
public interface AvatarSupplier {

  Component avatar();
}
