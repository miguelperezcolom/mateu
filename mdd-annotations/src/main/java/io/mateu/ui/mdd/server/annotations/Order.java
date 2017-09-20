package io.mateu.ui.mdd.server.annotations;

import java.lang.annotation.*;

/**
 * Created by miguel on 18/1/17.
 */
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.FIELD) //can use in method only.
public @interface Order {

    boolean desc() default false;

    int priority() default 0;
}