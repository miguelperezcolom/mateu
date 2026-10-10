package io.mateu.uidl.annotations;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * On a listing (a {@code Listing}, an {@code AutoCrud}): its rows can be DRAGGED — the selected
 * rows, or the one under the pointer — and dropped on a {@link io.mateu.uidl.data.DropZone} that
 * accepts this type, which runs its action with the dragged ids ({@code _draggedIds}) and its own
 * parameters: moving folio charges to another window, adding items to a cart.
 */
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.TYPE, ElementType.ANNOTATION_TYPE})
@Experimental("drag rows to a destination (3.0-alpha.409)")
public @interface DragRows {

  /** The drag type a drop zone accepts (e.g. "charge"). */
  String value();
}
