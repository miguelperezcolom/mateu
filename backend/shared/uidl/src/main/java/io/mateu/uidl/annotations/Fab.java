package io.mateu.uidl.annotations;

import io.mateu.uidl.data.ButtonStyle;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.METHOD, ElementType.ANNOTATION_TYPE})
public @interface Fab {

  String icon() default "vaadin:plus";

  String label() default "";

  ButtonStyle buttonStyle() default ButtonStyle.primary;

  int order() default 0;
}
