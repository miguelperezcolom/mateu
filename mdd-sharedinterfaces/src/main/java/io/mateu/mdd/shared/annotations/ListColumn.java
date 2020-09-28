package io.mateu.mdd.shared.annotations;


import java.lang.annotation.*;

/**
 * Created by miguel on 18/1/17.
 */
@Repeatable(ListColumns.class)
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.FIELD) //can use in method only.
public @interface ListColumn {

    String value() default "";

    String field() default "";
}