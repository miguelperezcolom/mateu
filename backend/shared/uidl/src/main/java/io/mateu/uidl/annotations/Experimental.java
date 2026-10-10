package io.mateu.uidl.annotations;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Marks a public type or member as <b>experimental</b>: usable, but outside the stability promise.
 *
 * <p>Experimental API may change or disappear in a <em>minor</em> release, without the usual
 * one-minor deprecation period (see "Stability &amp; versioning" in the docs). The API
 * compatibility check run on every build ({@code japicmp}) ignores changes to anything carrying
 * this annotation.
 *
 * <p>Annotating a type covers all of its members. Remove the annotation — in a minor release — when
 * the API is promoted to stable; from then on the regular deprecation policy applies.
 */
@Documented
@Retention(RetentionPolicy.RUNTIME)
@Target({
  ElementType.TYPE,
  ElementType.METHOD,
  ElementType.FIELD,
  ElementType.CONSTRUCTOR,
  ElementType.ANNOTATION_TYPE
})
public @interface Experimental {

  /** Optional: why it is experimental, or what is still expected to change. */
  String value() default "";
}
