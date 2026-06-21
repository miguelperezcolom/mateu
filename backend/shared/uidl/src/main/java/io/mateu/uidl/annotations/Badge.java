package io.mateu.uidl.annotations;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Marks a method as a page-level badge supplier. Two usage patterns:
 *
 * <p>1. Method returns {@code String}: the returned string is used as badge text; a null or blank
 * return means the badge is not shown.
 *
 * <p>2. Method returns {@code boolean}: badge is shown (using {@code label}) only when the method
 * returns {@code true}.
 */
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
public @interface Badge {

  /** Badge text when the method returns boolean true. Ignored for String-returning methods. */
  String label() default "";

  String color() default "normal";

  boolean primary() default false;

  boolean small() default true;

  boolean pill() default true;
}
