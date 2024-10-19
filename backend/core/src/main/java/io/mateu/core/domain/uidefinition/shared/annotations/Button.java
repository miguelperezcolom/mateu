package io.mateu.core.domain.uidefinition.shared.annotations;

import io.mateu.core.domain.uidefinition.core.interfaces.Icon;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/** Created by miguel on 18/1/17. */
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.FIELD})
public @interface Button {

  String value() default "";

  Icon icon() default Icon.None;

  String confirmationTitle() default "";

  String confirmationMessage() default "";

  String confirmationAction() default "";

  boolean validateBefore() default true;

  boolean rowsSelectedRequired() default false;

  int order() default Integer.MAX_VALUE;

  ActionType type() default ActionType.Primary;

  boolean visible() default true;

  ActionTarget target() default ActionTarget.View;

  String targetId() default "";

  String modalStyle() default "";

  String customEvent() default "";

  String href() default "";

  boolean runOnEnter() default false;

  boolean closeModalWindow() default false;
}
