package io.mateu.uidl.annotations;

import io.mateu.uidl.data.ButtonColor;
import io.mateu.uidl.data.ButtonSize;
import io.mateu.uidl.data.ButtonStyle;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.FIELD, ElementType.METHOD})
public @interface Button {
  ButtonStyle buttonStyle() default ButtonStyle.none;

  ButtonColor buttonColor() default ButtonColor.none;

  ButtonSize buttonSize() default ButtonSize.none;

  String group() default "";

  boolean separatorBefore() default false;

  int order() default 0;
}
