package io.mateu.uidl.annotations;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Marks the field whose value is shown as the page's "last updated" timestamp in the header (the
 * Oracle Redwood timestamp header element, required next to a Save button on transactional pages).
 * The field's value is rendered as text (its {@code toString()}); a {@code null} value hides the
 * timestamp. The field is excluded from the form body (like {@link BadgeInHeader}). Only the first
 * {@code @Timestamp} field is used.
 */
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.FIELD, ElementType.ANNOTATION_TYPE})
public @interface Timestamp {

  /** Optional label shown before the value (e.g. {@code "Last updated"}). */
  String value() default "";
}
