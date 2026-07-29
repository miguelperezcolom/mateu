package io.mateu.uidl.interfaces;

/**
 * Interaction capability: declaring it on a {@link Listing} makes records editable — the detail
 * gains an Edit button opening the form {@link #edit} returns ({@code /:id/edit}), and submitting
 * it calls {@link #save} with the form state hydrated in the request.
 *
 * @param <Editor> the form shown in the edit screen (a plain view model — no interface required)
 * @param <Id> the record id type
 */
public interface Editable<Editor, Id> {

  Editor edit(Id id, HttpRequest httpRequest);

  /** Persists the submitted edit-form state and returns the record id (to navigate back). */
  Id save(HttpRequest httpRequest);
}
