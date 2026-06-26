package io.mateu.uidl.annotations;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Marks a field as a badge to be shown in the page/form header strip (not in the form body). The
 * field is automatically excluded from the form layout.
 *
 * <p>For boolean fields: badge is shown when the value is {@code true}, using {@code label} as text
 * (falls back to the field's label if empty).
 *
 * <p>For String fields: the field value is used as badge text; null or blank hides the badge.
 *
 * <p>For programmatic control implement {@link io.mateu.uidl.interfaces.BadgeSupplier}.
 */
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.FIELD, ElementType.ANNOTATION_TYPE})
public @interface BadgeInHeader {

  /** Badge text override. For boolean fields: shown when true. Falls back to field label. */
  String label() default "";

  String color() default "normal";

  boolean primary() default false;

  boolean small() default true;

  boolean pill() default true;
}
