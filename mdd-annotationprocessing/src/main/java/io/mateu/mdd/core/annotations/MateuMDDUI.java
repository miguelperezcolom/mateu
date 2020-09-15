package io.mateu.mdd.core.annotations;

import io.mateu.mdd.core.services.FakeServiceProvider;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Created by miguel on 18/1/17.
 */
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.TYPE}) //can use in method only.
public @interface MateuMDDUI {

    String path();

    String theme() default "mateumddtheme";

    Class serviceProvider() default FakeServiceProvider.class;
}