package io.mateu.uidl.annotations;

public @interface Accordion {

  String style() default "";

  int opened() default 0;
}
