package io.mateu.uidl.annotations;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Renders a String field as a compact inline banner (the {@link io.mateu.uidl.data.Notice}
 * component): the field's value is the notice text — a {@code null}/blank value hides the notice
 * entirely, so the field doubles as its own visibility switch. {@code theme} tints it; {@code slim}
 * drops the strip's margins/padding (like {@code @Text(noMargins=true)}); {@code fullWidth} spans
 * the full form width; an optional {@code actionLabel} + {@code actionId} renders a small
 * right-aligned action.
 */
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.FIELD, ElementType.ANNOTATION_TYPE})
public @interface Notice {

  /** info | success | warning | danger. */
  String theme() default "info";

  /** Overrides the theme's default severity glyph. */
  String icon() default "";

  /** Tight variant: no block margins and reduced padding. */
  boolean slim() default false;

  /** Spans the full form width (all columns). */
  boolean fullWidth() default false;

  String actionLabel() default "";

  String actionId() default "";
}
