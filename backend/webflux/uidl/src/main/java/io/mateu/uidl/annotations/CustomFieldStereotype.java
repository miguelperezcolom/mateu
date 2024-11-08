package io.mateu.uidl.annotations;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/** Created by miguel on 18/1/17. */
@Retention(RetentionPolicy.RUNTIME)
@Target({
  ElementType.FIELD,
  ElementType.METHOD,
  ElementType.PARAMETER,
  ElementType.TYPE
}) // can use in method only.
public @interface CustomFieldStereotype {

  String value();
}
