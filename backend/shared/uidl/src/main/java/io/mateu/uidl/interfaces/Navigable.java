package io.mateu.uidl.interfaces;

/**
 * Interaction capability: declaring it on a {@link Listing} makes rows clickable — clicking opens
 * the read-only detail page ({@code /:id}) rendered from the object {@link #view} returns.
 *
 * @param <Detail> the object rendered in the detail screen
 * @param <Id> the record id type
 */
public interface Navigable<Detail, Id> {

  Detail view(Id id, HttpRequest httpRequest);
}
