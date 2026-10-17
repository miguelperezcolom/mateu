package io.mateu.uidl.annotations;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Shows the field as a KPI of the PAGE HEADER — its label (the field name humanised, or
 * {@code @Label}) over its current value — instead of as a form field: the field leaves the form
 * body.
 *
 * <pre>{@code
 * @KPI double balance;
 * }</pre>
 *
 * <p>For dashboard tiles use a {@code MetricCard} component (or the {@code Dashboard} archetype);
 * for status chips in the header use {@link BadgeInHeader}.
 */
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.FIELD, ElementType.ANNOTATION_TYPE})
@Documented
public @interface KPI {}
