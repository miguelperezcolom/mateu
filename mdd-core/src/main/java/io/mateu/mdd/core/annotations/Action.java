package io.mateu.mdd.core.annotations;

import com.vaadin.icons.VaadinIcons;
import com.vaadin.server.FontIcon;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Created by miguel on 18/1/17.
 */
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD) //can use in method only.
public @interface Action {

    String value() default "";

    VaadinIcons icon() default VaadinIcons.BOLT;

    boolean callOnEnterKeyPressed() default false;

    boolean addAsButton() default false;

    String confirmationMessage() default "";

    boolean keepOpened() default false;

    int order() default 1000;

    String attachToField() default "";

}