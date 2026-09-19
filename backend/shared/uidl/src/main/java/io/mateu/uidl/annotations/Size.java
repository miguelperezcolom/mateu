package io.mateu.uidl.annotations;

import java.lang.annotation.ElementType;
import java.lang.annotation.Inherited;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Explicit sizing intent for a component (coherence-plan #8) — the override for the inferred
 * default (a listing infers {@code fill}). Declares whether the component should {@code hug} its
 * content, {@code fill} the space its parent leaves (scrolling internally), or take a {@code fixed}
 * size.
 *
 * <p>On a routed view / {@code ComponentTreeSupplier} it sizes the whole surface — e.g. a
 * full-canvas screen (a board, a map, a planner) that should fill the viewport and scroll
 * internally rather than grow the page. Composable (usable as a meta-annotation) and read through
 * {@code MetaAnnotations}.
 *
 * <pre>{@code
 * @UI("/board") @Size(SizeMode.fill)
 * class Board implements ComponentTreeSupplier { ... }
 * }</pre>
 */
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.TYPE, ElementType.FIELD, ElementType.ANNOTATION_TYPE})
@Inherited
public @interface Size {

  /** The sizing intent. */
  SizeMode value();

  /** The concrete length when {@link #value()} is {@link SizeMode#fixed} (e.g. "15rem"). */
  String length() default "";
}
