package io.mateu.uidl.annotations;

public @interface Scroller {

  String direction() default "";

  String style() default "";
}
