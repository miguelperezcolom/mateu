package io.mateu.mdd.shared.annotations;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/** Created by miguel on 18/1/17. */
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.FIELD, ElementType.PARAMETER}) // can use in method only.
public @interface UseLinkToListView {

  Class listViewClass() default Void.class;

  boolean addEnabled() default false;

  boolean deleteEnabled() default false;

  String fields() default "";

  String actions() default "";
}
