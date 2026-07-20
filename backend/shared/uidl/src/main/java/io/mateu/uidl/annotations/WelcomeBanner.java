package io.mateu.uidl.annotations;

import java.lang.annotation.ElementType;
import java.lang.annotation.Inherited;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Puts a welcome banner at the top of the page (the Redwood "Welcome Banner" element): a branded
 * hero band with a big title, a subtitle and an optional background image, rendered as a centered
 * {@code HeroSection} as the page's first content.
 *
 * <p>In the Redwood anatomy the accent color strip only shows on pages WITHOUT a welcome banner, so
 * renderers suppress it on any page that carries one (this annotation, or a {@code HeroSection}
 * anywhere in the content — the Welcome and Hero Search archetypes included).
 */
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.TYPE)
@Inherited
public @interface WelcomeBanner {

  /** Big banner title. Defaults to the page {@code @Title}. */
  String title() default "";

  /** Secondary line under the title. Empty for none. */
  String subtitle() default "";

  /** Optional background image URL for the banner (rendered with a dark overlay). */
  String image() default "";
}
