package io.mateu.uidl.annotations;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Renders this numeric field's listing filter as a min/max RANGE instead of a single-value input.
 * The bounds travel in the component state as {@code <fieldId>_from}/{@code <fieldId>_to} and reach
 * the repository as a {@code FilterCriterion} (between/gte/lte) — never inside the entity-shaped
 * filters object, which has no room for two values.
 *
 * <p>Temporal fields (LocalDate, LocalDateTime, LocalTime) don't need this annotation: their
 * filters are ranges by default (single-instant equality is almost never what a user wants).
 */
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.FIELD, ElementType.ANNOTATION_TYPE})
public @interface RangeFilter {}
