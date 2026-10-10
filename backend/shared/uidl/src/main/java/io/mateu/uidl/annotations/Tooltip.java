package io.mateu.uidl.annotations;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * On a listing row's field: hovering the field's CELL shows the text of another field of the same
 * row — e.g. {@code @Tooltip("rateBreakdown") BigDecimal rate} shows the per-night breakdown on the
 * rate cell. Line breaks in that text are kept. The source field can be {@code @Hidden}.
 */
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.FIELD, ElementType.ANNOTATION_TYPE})
public @interface Tooltip {

  /** The row field whose text is shown. */
  String value();
}
