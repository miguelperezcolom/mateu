package io.mateu.mdd.shared.annotations;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Created by miguel on 18/1/17.
 */
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.METHOD, ElementType.FIELD}) //can use in method only.
public @interface
Action {

    String value() default "";

    String icon() default "";

    String confirmationTitle() default "";

    String confirmationMessage() default "";

    String confirmationAction() default "";

    boolean validateBefore() default true;

}
