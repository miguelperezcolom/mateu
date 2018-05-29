package io.mateu.mdd.core.annotations;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Created by miguel on 18/1/17.
 */
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.FIELD) //can use in method only.
public @interface OwnedList {

    /* comma separated list of columns */
    String fields() default "";

    /* comma separated list of columns which must be totalized */
    String totalize() default "";

    /* comma separated list of Labels for columns*/
    String labels() default "";

}