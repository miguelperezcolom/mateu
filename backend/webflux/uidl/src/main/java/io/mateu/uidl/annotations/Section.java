package io.mateu.uidl.annotations;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/** Created by miguel on 18/1/17. */
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.FIELD, ElementType.PARAMETER}) // can use in method only.
public @interface Section {

  String value();

  String description() default "";

  boolean card() default true;

  String leftSideImageUrl() default "";

  String topImageUrl() default "";

  int columns() default 0;

  boolean sidePositionedLabel() default false;

  String itemLabelWidth() default "120px";
}
