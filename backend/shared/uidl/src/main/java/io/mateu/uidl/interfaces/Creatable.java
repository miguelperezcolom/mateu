package io.mateu.uidl.interfaces;

/**
 * Interaction capability: declaring it on a {@link Listing} adds the New button — it opens the
 * blank (or pre-populated) form {@link #creationForm} returns ({@code /new}), and submitting it
 * calls {@link #create} with the form state hydrated in the request.
 *
 * @param <Form> the form shown in the create screen (a plain view model — no interface required)
 * @param <Id> the record id type
 */
public interface Creatable<Form, Id> {

  Form creationForm(HttpRequest httpRequest);

  /** Persists the submitted creation-form state and returns the new record's id. */
  Id create(HttpRequest httpRequest);
}
