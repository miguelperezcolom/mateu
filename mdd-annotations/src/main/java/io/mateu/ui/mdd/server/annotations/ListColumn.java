package io.mateu.ui.mdd.server.annotations;

import io.mateu.ui.core.shared.CellStyleGenerator;

import java.lang.annotation.*;
import java.util.HashMap;
import java.util.Map;

/**
 * Created by miguel on 18/1/17.
 */
@Repeatable(ListColumns.class)
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.FIELD) //can use in method only.
public @interface ListColumn {

    String value() default "";

    String ql() default "";

    String field() default "";

    boolean order() default false;

    int width() default -1;
}