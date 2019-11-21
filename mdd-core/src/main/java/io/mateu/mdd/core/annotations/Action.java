package io.mateu.mdd.core.annotations;

import com.vaadin.icons.VaadinIcons;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Created by miguel on 18/1/17.
 */
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.METHOD, ElementType.FIELD}) //can use in method only.
public @interface Action {

    String value() default "";

    VaadinIcons icon() default VaadinIcons.ADOBE_FLASH;

    boolean callOnEnterKeyPressed() default false;

    boolean addAsButton() default false;

    String confirmationMessage() default "";

    boolean keepOpened() default false;

    int order() default 1000;

    String attachToField() default "";

    String style() default "";

    String section() default "";

    String group() default "";

    boolean saveBefore() default false;

    boolean saveAfter() default false;

    boolean refreshOnBack() default false;

    boolean validateBefore() default false;

    boolean isGrous() default false;
}