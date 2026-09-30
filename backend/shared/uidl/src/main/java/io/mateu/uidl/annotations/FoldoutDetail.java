package io.mateu.uidl.annotations;

import io.mateu.uidl.data.FoldoutOrientation;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Renders the <b>read-only view</b> of a record (a CRUD's detail page, a form shown read-only) as a
 * foldout: an overview with the record's key information plus one lateral panel per remaining
 * {@code @Section} — the Redwood Foldout Layout anatomy, built from the same class that draws the
 * editor. Editing and creating keep the regular form.
 *
 * <p>In the foldout, what has nothing to show is left out: a field with no value (null, blank, an
 * empty collection) is hidden, and a section whose fields are all hidden is not a panel. The page's
 * toolbar actions stay in the page header.
 *
 * <pre>{@code
 * @FoldoutDetail(overview = {"Booking", "Amounts"}, folded = {"Tracking"})
 * public class BookingViewModel { ... }
 * }</pre>
 */
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.TYPE, ElementType.ANNOTATION_TYPE})
public @interface FoldoutDetail {

  /**
   * The {@code @Section} titles whose fields make the overview, in this order. Empty (the default)
   * means the first section with something to show. The overview is drawn as a property list.
   */
  String[] overview() default {};

  /** Section titles whose panels start folded (closed); every other panel starts open. */
  String[] folded() default {};

  /**
   * Where the overview sits: {@link FoldoutOrientation#vertical} (default) pins it on the left with
   * the panels to its right; {@link FoldoutOrientation#horizontal} spans it across the top.
   */
  FoldoutOrientation orientation() default FoldoutOrientation.vertical;
}
