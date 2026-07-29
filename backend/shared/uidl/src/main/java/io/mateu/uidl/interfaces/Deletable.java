package io.mateu.uidl.interfaces;

import java.util.List;

/**
 * Interaction capability: declaring it on a {@link Listing} enables row selection and the Delete
 * button — deleting calls {@link #deleteAllById} with the selected ids.
 *
 * @param <Id> the record id type
 */
public interface Deletable<Id> {

  void deleteAllById(List<Id> selectedIds, HttpRequest httpRequest);
}
