package io.mateu.uidl.annotations;

public @interface Details {

  String theme() default "";

  String style() default "";

  String summary() default "";

  boolean opened() default false;
}
