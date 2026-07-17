package io.mateu.uidl.annotations;

import io.mateu.uidl.data.AggregateFunction;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Aggregates a listing column over the WHOLE filtered result set (not just the visible page): the
 * listing shows a totals footer with the computed value, and when combined with {@link GroupBy}
 * each group's subtotal row shows the per-group value too. Computed by {@code
 * CrudRepository.summaries} — in memory by default, overridable to push the aggregation to the
 * database.
 */
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.FIELD, ElementType.ANNOTATION_TYPE})
public @interface Aggregate {

  AggregateFunction value() default AggregateFunction.sum;
}
