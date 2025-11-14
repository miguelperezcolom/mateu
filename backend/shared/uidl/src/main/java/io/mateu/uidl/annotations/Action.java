package io.mateu.uidl.annotations;

import java.lang.annotation.Repeatable;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;

@Repeatable(Actions.class)
@Retention(RetentionPolicy.RUNTIME)
public @interface Action {

  String id();

  boolean background();

  boolean validationRequired();

  boolean confirmationRequired();

  boolean rowsSelectedRequired();

  String confirmationTitle();

  String confirmationMessage();

  String confirmationText();

  String confirmationDenialText();

  String modalStyle();

  String modalTitle();

  String customEventName();

  String customEventDetail();

  String href();

  String js();

  boolean sse();
}
