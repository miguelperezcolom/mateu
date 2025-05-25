package io.mateu.uidl.annotations;

public @interface FormLayout {

  String theme() default "";

  String style() default "";

  int columns() default 2;
}
