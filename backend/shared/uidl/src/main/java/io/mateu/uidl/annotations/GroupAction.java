package io.mateu.uidl.annotations;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Marks a listing method as an action on a {@link GroupBy} group: the grid renders a button on
 * every group header row that invokes the method. The clicked group's value travels as the {@code
 * _groupValue} action parameter ({@code httpRequest.runActionRq().parameters().get("_groupValue")}
 * on the server). Only meaningful on listings whose row class declares a {@code @GroupBy} column.
 */
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.METHOD, ElementType.ANNOTATION_TYPE})
public @interface GroupAction {

  /** The button label. */
  String value();
}
