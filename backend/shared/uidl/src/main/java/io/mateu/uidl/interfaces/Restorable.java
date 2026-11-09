package io.mateu.uidl.interfaces;

import io.mateu.uidl.annotations.Experimental;
import java.util.List;

/**
 * Interaction capability: a {@link Deletable} listing (an {@code AutoCrud}, a {@code Crud}, a
 * capability listing) that can bring deleted records back. Declaring it turns the delete into an
 * UNDOABLE one: Delete no longer asks for a confirmation, it deletes and answers a toast — "2
 * records deleted" — with an Undo button; Undo calls {@link #restoreAllById} with the same ids and
 * the listing searches again. Without it, Delete keeps asking first.
 *
 * <p>Mateu ships UI only: how the records come back is the app's (a soft delete flag, a trash
 * table, the store keeping the removed rows for a while). Restore must accept ids it no longer
 * holds (the toast may be clicked late) and must not restore what the caller could not delete.
 *
 * <p>A capability interface on the listing rather than a default method on {@code CrudStore}: the
 * framework has to know BEFORE deleting whether an undo can be offered (to drop the confirmation),
 * and a default method that throws can only be discovered by calling it. An {@code AutoCrud}
 * declares it and hands the ids to its store.
 *
 * @param <Id> the record id type, as in {@link Deletable}
 */
@Experimental("undoable delete (3.0, W-V-DELETE-FEEDBACK)")
public interface Restorable<Id> {

  /** The reserved action the Undo of a delete runs ({@code _restoreIds} carries the ids). */
  String RESTORE_ACTION = "restore-deleted";

  /** The parameter of {@link #RESTORE_ACTION} carrying the ids to restore. */
  String RESTORE_IDS = "_restoreIds";

  void restoreAllById(List<Id> deletedIds, HttpRequest httpRequest);
}
