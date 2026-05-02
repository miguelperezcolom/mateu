package io.mateu.uidl.annotations;

import java.lang.annotation.Repeatable;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;

@Repeatable(Actions.class)
@Retention(RetentionPolicy.RUNTIME)
public @interface Action {

  String id() default "";

  boolean background() default false;

  boolean validationRequired() default false;

  boolean confirmationRequired() default false;

  boolean rowsSelectedRequired() default false;

  String confirmationTitle() default "";

  String confirmationMessage() default "";

  String confirmationText() default "";

  String confirmationDenialText() default "";

  String modalStyle() default "";

  String modalTitle() default "";

  String customEventName() default "";

  String customEventDetail() default "";

  String href() default "";

  String js() default "";

  boolean sse() default false;

  String fieldsToValidate() default "";

  boolean bubble() default false;
}
