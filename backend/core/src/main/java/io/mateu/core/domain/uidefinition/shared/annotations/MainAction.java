package io.mateu.core.domain.uidefinition.shared.annotations;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/** Created by miguel on 18/1/17. */
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.METHOD})
public @interface MainAction {

  String value() default "";

  String icon() default "";

  String confirmationTitle() default "";

  String confirmationMessage() default "";

  String confirmationAction() default "";

  boolean validateBefore() default true;

  boolean rowsSelectedRequired() default false;

  int order() default 100;

  ActionType type() default ActionType.Primary;

  ActionTarget target() default ActionTarget.Self;

  String targetId() default "";

  String modalStyle() default "";

  String customEvent() default "";

  String href() default "";

  boolean runOnEnter() default false;

  ActionPosition position() default ActionPosition.Right;

  int timeoutMillis() default 0;

  boolean closeModalWindow() default false;

}
