package io.mateu.mdd.core.annotations;


import java.lang.annotation.*;

/**
 * Created by miguel on 18/1/17.
 */
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.TYPE) //can use in method only.
public @interface ExpandOnOpen {
}