package io.mateu.uidl.annotations;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/** Created by miguel on 18/1/17. */
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.FIELD, ElementType.METHOD})
public @interface Section {

  String value();

  int columns() default 1;

  String style() default "";

  /**
   * Name of the layout zone this section belongs to. When the form class is annotated with {@link
   * Zones}, sections sharing a zone are stacked together inside that zone's column, and the
   * declared zones are laid out side by side. Empty means no zone (classic full-width vertical
   * stacking).
   */
  String zone() default "";
}
