package io.mateu.uidl.annotations;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Marks a component field of a {@code Dashboard} as a titled panel tile. The field value (a chart,
 * a grid, any component) is wrapped in a {@code DashboardPanel} with this title and span.
 */
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.FIELD, ElementType.ANNOTATION_TYPE})
public @interface Panel {
  String title() default "";

  String subtitle() default "";

  int colSpan() default 1;

  int rowSpan() default 1;
}
