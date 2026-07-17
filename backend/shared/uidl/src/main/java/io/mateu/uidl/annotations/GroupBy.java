package io.mateu.uidl.annotations;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Groups the listing rows by this column: the column becomes the implicit primary sort so rows of
 * the same value are contiguous, and the grid renders a group subtotal row whenever the value
 * changes — showing the group value, its row count over the WHOLE filtered set, and the per-group
 * value of every {@link Aggregate} column. One {@code @GroupBy} column per row class.
 */
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.FIELD, ElementType.ANNOTATION_TYPE})
public @interface GroupBy {}
