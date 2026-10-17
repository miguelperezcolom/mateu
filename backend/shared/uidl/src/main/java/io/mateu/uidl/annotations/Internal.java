package io.mateu.uidl.annotations;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Marks a public type or member as <b>framework-internal</b>: {@code public} only because Mateu's
 * own modules (core, the adapters, the generated controllers) call it across packages and Java has
 * no module-private visibility. It is <em>not</em> part of the stability promise.
 *
 * <p>Internal API may change or disappear in any release, without deprecation (see "Stability &amp;
 * versioning" in the docs). The API compatibility check run on every build ({@code japicmp})
 * ignores anything carrying this annotation, exactly as it does for {@link Experimental}. Do not
 * call or override it from application code; when you need what it does, ask for a supported hook.
 *
 * <p>Annotating a type covers all of its members.
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
public @interface Internal {

  /** Optional: who uses it, or what to use instead. */
  String value() default "";
}
