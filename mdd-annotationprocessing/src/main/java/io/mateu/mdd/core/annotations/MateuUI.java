package io.mateu.mdd.core.annotations;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Created by miguel on 18/1/17.
 */
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.TYPE}) //can use in method only.
public @interface MateuUI {

    String path();

    String theme() default "mateu";

    String logo() default "";

    String persistenceUnitName() default "";

    String[] stylesheets() default {};

    String[] scripts() default {};

    String favIcon() default "";

}
