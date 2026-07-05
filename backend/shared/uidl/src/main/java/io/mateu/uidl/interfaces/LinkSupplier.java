package io.mateu.uidl.interfaces;

import io.mateu.uidl.data.NavLink;

/**
 * Implemented by a form to attach a navigation link icon to fields at runtime (an alternative to
 * the static {@code @LinkTo} annotation, over which this takes precedence). {@link #link(String,
 * HttpRequest)} returns the {@link NavLink} for the field named {@code memberName}, or {@code null}
 * for no link. The returned href may itself contain {@code ${...}} expressions, which are
 * interpolated client-side against the live component state.
 */
public interface LinkSupplier {

  NavLink link(String memberName, HttpRequest httpRequest);
}
