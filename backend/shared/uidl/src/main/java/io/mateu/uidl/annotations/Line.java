package io.mateu.uidl.annotations;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Puts a listing/CRUD row field on a given <b>line</b> of its row — for listings with too many
 * columns to fit side by side. Fields without it are on line 1 (the ordinary columns, with their
 * header labels, sorting and widths). When at least one column is on a line greater than 1, each
 * row is drawn on several lines: line 1 as usual, and under it, spanning the row, the columns of
 * line 2, 3… as secondary «Label: value» pairs.
 *
 * <p>Without any {@code @Line} in the row class the listing is unchanged. Composable ({@code
 * ANNOTATION_TYPE}) like the other field annotations; read via {@code MetaAnnotations}. Carried on
 * the wire as {@code GridColumn.line}.
 */
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.FIELD, ElementType.ANNOTATION_TYPE})
public @interface Line {
  /** The 1-based line of the row this column is drawn on. 1 = the ordinary columns. */
  int value();
}
